import mongoose, { Document, Schema } from "mongoose";

export interface ISettings extends Document {
  modulesVisibility: {
    sliders: boolean;
    statistics: boolean;
    ytvideo: boolean;
    reports: boolean;
    feedback: boolean;
    help: boolean;
    location_screen: boolean;
  };
  sliderAutoScrollInterval: number; // in milliseconds
  statisticsLink?: string;
  ytvideoLink?: string;
  splashImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const settingsSchema = new Schema<ISettings>(
  {
    modulesVisibility: {
      sliders: { type: Boolean, default: true },
      statistics: { type: Boolean, default: true },
      ytvideo: { type: Boolean, default: true },
      reports: { type: Boolean, default: true },
      feedback: { type: Boolean, default: true },
      help: { type: Boolean, default: true },
      location_screen: { type: Boolean, default: true },
    },
    sliderAutoScrollInterval: {
      type: Number,
      default: 5000, // 5 seconds
    },
    statisticsLink: {
      type: String,
      trim: true,
    },
    ytvideoLink: {
      type: String,
      trim: true,
    },
    splashImageUrl: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Settings =
  mongoose.models.Settings ||
  mongoose.model<ISettings>("Settings", settingsSchema);
