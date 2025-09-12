const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const { CommunityPost, CommunityReply } = require('../models/Community');

const router = express.Router();

// Configure multer for community images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/community';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `community-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Get community posts
router.get('/posts', async (req, res) => {
    try {
        const { 
            category, 
            district, 
            language, 
            limit = 20, 
            offset = 0, 
            sortBy = 'recent' 
        } = req.query;

        let query = { isModerated: { $ne: false } }; // Exclude moderated posts
        
        if (category) query.category = category;
        if (district) query.district = district;
        if (language) query.language = language;

        let sortOptions = {};
        switch (sortBy) {
            case 'popular':
                sortOptions = { voteScore: -1, createdAt: -1 };
                break;
            case 'trending':
                sortOptions = { views: -1, voteScore: -1 };
                break;
            case 'recent':
            default:
                sortOptions = { createdAt: -1 };
        }

        const posts = await CommunityPost.find(query)
            .populate('author', 'phoneNumber district profile.name')
            .sort(sortOptions)
            .limit(parseInt(limit))
            .skip(parseInt(offset));

        const total = await CommunityPost.countDocuments(query);

        res.status(200).json({
            success: true,
            posts,
            total,
            hasMore: (parseInt(offset) + parseInt(limit)) < total
        });

    } catch (error) {
        console.error('Get posts error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to fetch posts'
        });
    }
});

// Create new post
router.post('/posts', authenticateToken, upload.array('images', 5), [
    body('title').notEmpty().isLength({ min: 5, max: 200 }).withMessage('Title must be 5-200 characters'),
    body('content').notEmpty().isLength({ min: 10, max: 2000 }).withMessage('Content must be 10-2000 characters'),
    body('category').isIn([
        'crop_advisory', 'pest_disease', 'weather', 'market_prices', 
        'farming_techniques', 'government_schemes', 'general', 'qa'
    ]).withMessage('Invalid category'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
    body('language').optional().isIn(['en', 'hi', 'pa']).withMessage('Invalid language')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const { title, content, category, tags, language } = req.body;
        const user = req.user;

        // Process uploaded images
        const images = req.files ? req.files.map(file => `/uploads/community/${file.filename}`) : [];

        const post = new CommunityPost({
            author: user._id,
            title,
            content,
            category,
            tags: tags || [],
            images,
            district: user.district,
            language: language || user.language
        });

        await post.save();
        await post.populate('author', 'phoneNumber district profile.name');
        
        await user.addActivity('community_post_created', { 
            postId: post._id, 
            title: title.substring(0, 50),
            category 
        });

        res.status(201).json({
            success: true,
            message: 'Post created successfully',
            post
        });

    } catch (error) {
        console.error('Create post error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to create post'
        });
    }
});

// Get single post with replies
router.get('/posts/:postId', async (req, res) => {
    try {
        const { postId } = req.params;

        const post = await CommunityPost.findById(postId)
            .populate('author', 'phoneNumber district profile.name');

        if (!post) {
            return res.status(404).json({
                error: 'Post not found',
                message: 'The requested post does not exist'
            });
        }

        // Increment view count
        post.views += 1;
        await post.save();

        // Get replies
        const replies = await CommunityReply.find({ post: postId })
            .populate('author', 'phoneNumber district profile.name')
            .populate('parentReply')
            .sort({ createdAt: 1 });

        res.status(200).json({
            success: true,
            post,
            replies
        });

    } catch (error) {
        console.error('Get post error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to fetch post'
        });
    }
});

// Vote on post
router.post('/posts/:postId/vote', authenticateToken, [
    body('type').isIn(['up', 'down']).withMessage('Vote type must be up or down')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const { postId } = req.params;
        const { type } = req.body;
        const user = req.user;

        const post = await CommunityPost.findById(postId);
        if (!post) {
            return res.status(404).json({
                error: 'Post not found'
            });
        }

        // Remove existing votes by this user
        post.votes.up = post.votes.up.filter(vote => !vote.user.equals(user._id));
        post.votes.down = post.votes.down.filter(vote => !vote.user.equals(user._id));

        // Add new vote
        if (type === 'up') {
            post.votes.up.push({ user: user._id });
        } else {
            post.votes.down.push({ user: user._id });
        }

        await post.save();

        res.status(200).json({
            success: true,
            message: 'Vote recorded',
            voteScore: post.voteScore
        });

    } catch (error) {
        console.error('Vote error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to record vote'
        });
    }
});

// Reply to post
router.post('/posts/:postId/replies', authenticateToken, upload.array('images', 3), [
    body('content').notEmpty().isLength({ min: 5, max: 1000 }).withMessage('Reply must be 5-1000 characters'),
    body('parentReply').optional().isMongoId().withMessage('Invalid parent reply ID')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const { postId } = req.params;
        const { content, parentReply } = req.body;
        const user = req.user;

        const post = await CommunityPost.findById(postId);
        if (!post) {
            return res.status(404).json({
                error: 'Post not found'
            });
        }

        const images = req.files ? req.files.map(file => `/uploads/community/${file.filename}`) : [];

        const reply = new CommunityReply({
            post: postId,
            author: user._id,
            content,
            images,
            parentReply: parentReply || null
        });

        await reply.save();
        await reply.populate('author', 'phoneNumber district profile.name');

        await user.addActivity('community_reply_created', { 
            postId, 
            replyId: reply._id,
            content: content.substring(0, 50) 
        });

        res.status(201).json({
            success: true,
            message: 'Reply added successfully',
            reply
        });

    } catch (error) {
        console.error('Reply error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to add reply'
        });
    }
});

// Get categories with post counts
router.get('/categories', async (req, res) => {
    try {
        const categories = await CommunityPost.aggregate([
            { $match: { isModerated: { $ne: false } } },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        res.status(200).json({
            success: true,
            categories
        });

    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to fetch categories'
        });
    }
});

module.exports = router;
