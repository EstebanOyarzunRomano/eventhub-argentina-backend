import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        location: {
            type: String,
            required: true,
        },
        capacity: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ["disponible", "cacnelado", "terminado"],
            default: "disponible",
        },
    },
    {
        timestamps: true,
    }
);

const Event = mongoose.model('Event', userSchema);
export default Event;