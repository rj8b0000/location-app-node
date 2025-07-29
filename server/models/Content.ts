import mongoose, { Document, Schema } from 'mongoose';

export interface IContent extends Document {
  title: string;
  content: string;
  isActive: boolean;
  order: number;
  wordCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const contentSchema = new Schema<IContent>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(text: string) {
        const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;
        return wordCount <= 30;
      },
      message: 'Content cannot exceed 30 words'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  wordCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Pre-save middleware to calculate word count
contentSchema.pre('save', function(next) {
  if (this.content) {
    this.wordCount = this.content.trim().split(/\s+/).filter(word => word.length > 0).length;
  }
  next();
});

export const Content = mongoose.models.Content || mongoose.model<IContent>('Content', contentSchema);
