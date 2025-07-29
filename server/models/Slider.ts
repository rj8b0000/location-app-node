import mongoose, { Document, Schema } from 'mongoose';

export interface ISlider extends Document {
  title?: string;
  imageUrl: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const sliderSchema = new Schema<ISlider>({
  title: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export const Slider = mongoose.models.Slider || mongoose.model<ISlider>('Slider', sliderSchema);
