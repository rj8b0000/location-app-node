import mongoose, { Document, Schema } from 'mongoose';

export interface ISettings extends Document {
  modulesVisibility: {
    sliders: boolean;
    statistics: boolean;
    reports: boolean;
    feedback: boolean;
    help: boolean;
  };
  sliderAutoScrollInterval: number; // in milliseconds
  statisticsLink?: string;
  createdAt: Date;
  updatedAt: Date;
}

const settingsSchema = new Schema<ISettings>({
  modulesVisibility: {
    sliders: { type: Boolean, default: true },
    statistics: { type: Boolean, default: true },
    reports: { type: Boolean, default: true },
    feedback: { type: Boolean, default: true },
    help: { type: Boolean, default: true }
  },
  sliderAutoScrollInterval: {
    type: Number,
    default: 5000 // 5 seconds
  },
  statisticsLink: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

export const Settings = mongoose.model<ISettings>('Settings', settingsSchema);
