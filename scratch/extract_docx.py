import sys
try:
    import docx
except ImportError:
    print("ERROR: python-docx not installed. Please install it with 'pip install python-docx'")
    sys.exit(1)

def extract_text(path):
    doc = docx.Document(path)
    fullText = []
    for para in doc.paragraphs:
        fullText.append(para.text)
    return '\n'.join(fullText)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python extract_docx.py <path>")
        sys.exit(1)
    print(extract_text(sys.argv[1]))
