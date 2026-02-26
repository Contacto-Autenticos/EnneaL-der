import os
import sys

def create_skill(skill_name, description):
    # Normalize skill name
    skill_folder = skill_name.lower().replace(" ", "-")
    base_path = os.path.join(".agent", "skills", skill_folder)
    
    # Create directory structure
    try:
        os.makedirs(base_path, exist_ok=True)
        os.makedirs(os.path.join(base_path, "scripts"), exist_ok=True)
        os.makedirs(os.path.join(base_path, "examples"), exist_ok=True)
        os.makedirs(os.path.join(base_path, "resources"), exist_ok=True)
    except Exception as e:
        print(f"Error al crear directorios: {e}")
        return

    # Create SKILL.md
    skill_md_path = os.path.join(base_path, "SKILL.md")
    content = f"""---
name: {skill_folder}
description: {description}
---

# {skill_name}

## Introducción
Describe el propósito de esta habilidad aquí.

## Guía de Uso
1. Paso uno...
2. Paso dos...

## Lista de Verificación
- [ ] Tarea 1
- [ ] Tarea 2
"""
    
    try:
        with open(skill_md_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Habilidad '{skill_name}' creada exitosamente en {base_path}")
    except Exception as e:
        print(f"Error al escribir SKILL.md: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Uso: python create_skill.py <nombre-habilidad> <descripcion>")
    else:
        create_skill(sys.argv[1], sys.argv[2])
