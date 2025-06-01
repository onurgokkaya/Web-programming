import mongoose, { Schema } from "mongoose";

const dataSchema = new Schema({
  mail: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    trim: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  text: [{
    originalText: { type: String, required: true },
    translatedText: { type: String, required: true },
    sourceLanguage: { type: String, required: true },
    targetLanguage: { type: String, required: true },
    isStar: {type: Boolean, default: false},
    date: { type: Date, default: Date.now }
  }]
})

const User = mongoose.models.User || mongoose.model('User', dataSchema);

const OAuthSchema = new Schema({
  mail: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  translatedText: [{
    originalText: { type: String, required: true },
    translatedText: { type: String, required: true },
    sourceLanguage: { type: String, required: true },
    targetLanguage: { type: String, required: true },
    isStar: {type: Boolean, default: false},
    date: { type: Date, default: Date.now }
  }]
})

const userOAuth = mongoose.models.userOAuth || mongoose.model('userOAuth', OAuthSchema);
export {User, userOAuth} 

