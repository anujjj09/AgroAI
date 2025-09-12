const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        maxlength: 200
    },
    content: {
        type: String,
        required: true,
        maxlength: 2000
    },
    category: {
        type: String,
        required: true,
        enum: [
            'crop_advisory', 'pest_disease', 'weather', 'market_prices', 
            'farming_techniques', 'government_schemes', 'general', 'qa'
        ]
    },
    tags: [String],
    images: [String], // URLs of uploaded images
    district: String, // Author's district for local relevance
    language: {
        type: String,
        enum: ['en', 'hi', 'pa'],
        default: 'en'
    },
    votes: {
        up: [{
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            createdAt: { type: Date, default: Date.now }
        }],
        down: [{
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            createdAt: { type: Date, default: Date.now }
        }]
    },
    voteScore: {
        type: Number,
        default: 0
    },
    views: {
        type: Number,
        default: 0
    },
    isExpertAnswer: {
        type: Boolean,
        default: false
    },
    isModerated: {
        type: Boolean,
        default: false
    },
    moderationNotes: String,
    isFeatured: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const replySchema = new mongoose.Schema({
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CommunityPost',
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true,
        maxlength: 1000
    },
    images: [String],
    parentReply: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CommunityReply'
    },
    votes: {
        up: [{
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            createdAt: { type: Date, default: Date.now }
        }],
        down: [{
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            createdAt: { type: Date, default: Date.now }
        }]
    },
    voteScore: {
        type: Number,
        default: 0
    },
    isExpertAnswer: {
        type: Boolean,
        default: false
    },
    isModerated: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Indexes
postSchema.index({ category: 1, createdAt: -1 });
postSchema.index({ district: 1, createdAt: -1 });
postSchema.index({ language: 1, createdAt: -1 });
postSchema.index({ voteScore: -1, createdAt: -1 });
postSchema.index({ tags: 1 });

replySchema.index({ post: 1, createdAt: -1 });
replySchema.index({ parentReply: 1, createdAt: -1 });

// Update vote score on save
postSchema.pre('save', function(next) {
    this.voteScore = this.votes.up.length - this.votes.down.length;
    this.updatedAt = Date.now();
    next();
});

replySchema.pre('save', function(next) {
    this.voteScore = this.votes.up.length - this.votes.down.length;
    this.updatedAt = Date.now();
    next();
});

const CommunityPost = mongoose.model('CommunityPost', postSchema);
const CommunityReply = mongoose.model('CommunityReply', replySchema);

module.exports = { CommunityPost, CommunityReply };
