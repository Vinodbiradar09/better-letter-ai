import { v2 as cloudinary } from 'cloudinary';
import { LetterT } from '../types/ApiRes';

cloudinary.config(
    {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    }
)

interface CloudinaryUploadResult {
    success: boolean;
    url?: string;
    secureUrl?: string;
    publicId?: string;
    error?: string;
}

export async function uploadLetterPDFToCloudinary(pdfBuffer : Buffer , letterData : LetterT) : Promise<CloudinaryUploadResult> {
    try {
        console.log("uploading pdf to the cloudinary");
        const filename = `letters/${letterData.from.usn}_${letterData._id}_${Date.now()}`;

        const uploadResult = await new Promise<any>((resolve , reject)=>{
            cloudinary.uploader.upload_stream(
                {
                    resource_type : "raw",
                    public_id : filename,
                    folder: 'leave_letters',
                    format: 'pdf',
                    tags: [
                        `student_${letterData.from.usn}`,
                        `mentor_${letterData.to.name.replace(/\s+/g, '_')}`,
                        'leave_letter',
                        `year_${new Date().getFullYear()}`
                    ]
                },
                (error , result)=>{
                    if(error){
                        reject(error);
                    }else{
                        resolve(result);
                    }
                }
            ).end(pdfBuffer);
        })
        console.log('PDF uploaded successfully to Cloudinary');

        return {
            success : true,
            url : uploadResult.url,
            secureUrl : uploadResult?.secure_url,
            publicId: uploadResult.public_id
        }
    } catch (error : any) {
        console.error('Cloudinary upload error:', error);
        return {
            success: false,
            error: error.message || 'Failed to upload PDF to Cloudinary'
        };
    }
}
