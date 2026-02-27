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
            throw new Error(`Error en Supabase: ${error.message} (Verifica que el bucket 'test-results' sea público y existan políticas de subida)`);
        }

        const { data: publicUrlData } = supabase.storage
            .from('test-results')
            .getPublicUrl(fileName);

        if (!publicUrlData || !publicUrlData.publicUrl) {
            throw new Error('No se pudo obtener la URL pública de la imagen.');
        }

        return publicUrlData.publicUrl;
    } catch (err) {
        console.error('Unexpected error during image upload:', err);
        throw err;
    }
};
