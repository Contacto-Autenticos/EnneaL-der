import JSZip from 'jszip';

/**
 * Extrae texto plano de un archivo .pptx
 * @param {File} file El archivo PowerPoint subido
 * @returns {Promise<string>} Texto extraído de todas las diapositivas
 */
export async function extractTextFromPPTX(file) {
  try {
    const zip = new JSZip();
    const contents = await zip.loadAsync(file);
    
    // Buscar todos los archivos xml de diapositivas
    const slideFiles = [];
    contents.folder("ppt/slides").forEach((relativePath, file) => {
      if (relativePath.match(/^slide\d+\.xml$/)) {
        slideFiles.push(file);
      }
    });

    if (slideFiles.length === 0) {
      throw new Error("No se encontraron diapositivas en el archivo.");
    }

    // Ordenar por número de slide (slide1.xml, slide2.xml...)
    slideFiles.sort((a, b) => {
      const numA = parseInt(a.name.match(/slide(\d+)\.xml/)[1]);
      const numB = parseInt(b.name.match(/slide(\d+)\.xml/)[1]);
      return numA - numB;
    });

    let allText = [];

    // Extraer texto de cada slide
    for (const slideFile of slideFiles) {
      const xmlData = await slideFile.async("text");
      
      // Una regex sencilla para extraer el texto dentro de las etiquetas <a:t>
      // que es donde PPTX guarda los fragmentos de texto
      const regex = /<a:t[^>]*>(.*?)<\/a:t>/g;
      let match;
      let slideText = [];
      
      while ((match = regex.exec(xmlData)) !== null) {
        if (match[1].trim()) {
          slideText.push(match[1]);
        }
      }
      
      if (slideText.length > 0) {
        allText.push(`--- Diapositiva ---`);
        allText.push(slideText.join(" "));
      }
    }

    return allText.join('\n\n');
  } catch (error) {
    console.error("Error al extraer texto del PPTX:", error);
    throw new Error("No se pudo procesar el archivo PowerPoint. Asegúrate de que no esté dañado o protegido con contraseña.");
  }
}
