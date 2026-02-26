---
name: creador-de-habilidades
description: Esta habilidad permite al agente crear nuevas habilidades (Skills) en el workspace siguiendo el estándar de Antigravity, con instrucciones y metadatos en español. Úsala cuando necesites automatizar tareas recurrentes o añadir nuevas capacidades al agente.
---

# Creador de Habilidades

Esta habilidad guía al agente en la creación de nuevas habilidades para extender sus capacidades.

## Estructura de una Habilidad
Cada habilidad debe residir en su propia carpeta dentro de `.agent/skills/` y contener al menos un archivo `SKILL.md`.

- `.agent/skills/<nombre-de-la-habilidad>/`
  - `SKILL.md` (Requerido): Instrucciones y metadatos.
  - `scripts/` (Opcional): Scripts de automatización.
  - `examples/` (Opcional): Ejemplos de uso.
  - `resources/` (Opcional): Recursos adicionales.

## Pasos para crear una Habilidad

1. **Definir el Propósito**: Identifica una tarea específica que deba ser mejorada o automatizada.
2. **Crear el Directorio**: Crea una subcarpeta en `.agent/skills/` con un nombre descriptivo en minúsculas y separado por guiones.
3. **Redactar `SKILL.md`**:
   - Incluye el frontmatter YAML con `name` y `description` (en español).
   - Escribe instrucciones claras y detalladas en Markdown.
   - Define listas de verificación (checklists) para asegurar la calidad.
4. **Agregar Scripts (Opcional)**: Si la habilidad requiere automatización, añade scripts en la carpeta `scripts/`.
5. **Verificar**: Prueba la habilidad simulando una tarea para asegurar que las instrucciones sean seguidas correctamente.

## Formato del archivo `SKILL.md`

```markdown
---
name: nombre-de-la-habilidad
description: Breve descripción en español que explique cuándo usar esta habilidad.
---

# Título de la Habilidad

Instrucciones detalladas aquí...
```
