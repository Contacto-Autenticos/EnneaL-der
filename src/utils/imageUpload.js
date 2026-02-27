import { supabase } from '../supabaseClient';

/**
 * Uploads an image blob to Supabase Storage and returns the public URL.
 * @param {Blob} imageBlob - The image data to upload.
 * @param {string} fileName - The desired name for the file.
 * @returns {Promise<string|null>} The public URL of the uploaded image, or null on error.
 */
export const uploadResultImage = async (imageBlob, fileName) => {
    try {
        const { data, error } = await supabase.storage
            .from('test-results')
            .upload(fileName, imageBlob, {
                cacheControl: '3600',
                upsert: true,
                contentType: 'image/png'
            });

        if (error) {
            console.error('Error uploading image to Supabase:', error);
            return null;
        }

        const { data: publicUrlData } = supabase.storage
            .from('test-results')
            .getPublicUrl(fileName);

        return publicUrlData.publicUrl;
    } catch (err) {
        console.error('Unexpected error during image upload:', err);
        return null;
    }
};
