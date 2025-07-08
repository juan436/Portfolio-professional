// portfolio/models/otherSkills.model.ts
import mongoose, { Document } from 'mongoose';

export interface IOtherSkill extends Document {
    name: string;
    translations?: {
        en?: {
            name: string;
        };
        fr?: {
            name: string;
        };
        it?: {
            name: string;
        };
    };
}

const OtherSkillSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    translations: {
        en: {
            name: String
        },
        fr: {
            name: String
        },
        it: {
            name: String
        }
    }
}, {
    timestamps: true
});

export default mongoose.models.OtherSkill as mongoose.Model<IOtherSkill> ||
    mongoose.model<IOtherSkill>('OtherSkill', OtherSkillSchema);