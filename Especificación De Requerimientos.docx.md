Especificación De Requerimientos – App Eneagrama & Liderazgo

**1\. Visión general**

La aplicación es una app web orientada al autoconocimiento y desarrollo del liderazgo mediante un test de eneagrama breve, visual y emocional. Su función principal es identificar el eneatipo que más resuena con el usuario en el momento actual, de forma orientativa (no diagnóstica), y servir como puente hacia un proceso más profundo alojado en un sitio web externo.

---

**2\. Objetivo del sistema**

* Ofrecer un test de eneagrama corto, intuitivo y fácil de usar.  
* Generar un resultado visual, emocional y compartible.  
* Gestionar usuarios mediante un sistema simple de suscripción.  
* Aplicar reglas claras y transparentes de puntuación y desempate.  
* Mantener un diseño minimalista, rápido y accesible.

---

**3\. Alcance funcional**

**3.1 Gestión de usuarios (suscripción)**

El sistema debe permitir:

* Registro de usuario mediante nombre y correo electrónico.  
* Edición de datos básicos del usuario.  
* Identificación del usuario para asociar su resultado.

No se requiere autenticación compleja ni gestión de pagos en esta fase.

---

**4\. Flujo del usuario**

1. Pantalla inicial con mensaje de propósito (eneagrama \+ liderazgo).  
2. Registro simple (nombre y email).  
3. Instrucciones breves del test.  
4. Desarrollo del test (6 preguntas).  
5. Cálculo automático del resultado.  
6. Visualización del eneatipo con texto, imagen y CTA.  
7. Opción de compartir resultado.

---

**5\. Estructura del test**

**5.1 Escala de respuestas**

Cada afirmación se responde con una escala de 1 a 4:

* 1: No me describe (0 puntos)  
* 2: Me describe poco (1 punto)  
* 3: Me describe bastante (2 puntos)  
* 4: Me describe totalmente (3 puntos)

---

**5.2 Bloques y enunciados**

**Tipo A – Acción, iniciativa y empuje**

1. Cuando tengo un objetivo claro, prefiero actuar de inmediato y hacer que las cosas sucedan.  
2. Me resulta natural tomar la iniciativa y avanzar, incluso cuando otros dudan o esperan.  
3. Disfruto involucrarme intensamente en lo que hago y sentir que estoy generando impacto real.

**Tipo B – Reserva, mundo interior y ritmo propio**

4. Me siento cómodo(a) pasando tiempo a solas y no necesito estar en constante actividad para sentirme bien.  
5. Suelo observar más de lo que hablo y prefiero no ser el centro de atención.  
6. Valoro tener espacios tranquilos para imaginar, reflexionar o simplemente estar.

**Tipo C – Responsabilidad, compromiso y deber**

7. Cumplir con lo que me comprometo es muy importante para mí, incluso cuando implica esfuerzo personal.  
8. A menudo priorizo lo que otros necesitan o esperan de mí antes que mis propios deseos.  
9. Me siento bien cuando sé que he respondido con responsabilidad y he hecho lo correcto.

**Tipo X – Optimismo y disfrute**

10. Suelo ver el lado positivo de las situaciones y confiar en que las cosas se acomodarán.  
11. Me entusiasma compartir con otras personas y contagiar buen ánimo cuando estoy bien.  
12. A veces prefiero seguir adelante con buena actitud antes que quedarme demasiado tiempo en lo que me preocupa.

**Tipo Y – Intensidad emocional y reacción**

13. Vivo mis emociones con intensidad y normalmente se nota cuando algo me afecta.  
14. Necesito tener claro dónde estoy parado(a) con los demás y qué puedo esperar de ellos.  
15. Cuando algo me molesta, me cuesta quedármelo para mí y suelo reaccionar con fuerza.

**Tipo Z – Control y distancia emocional**

16. Prefiero manejar las situaciones con lógica y control, más que desde la emoción.  
17. Me resulta más cómodo trabajar de forma independiente y sin demasiada carga emocional.  
18. Cuando hay tensiones o conflictos, intento no involucrarme emocionalmente.

---

**6\. Lógica de puntuación**

**6.1 Puntuación por bloque**

* Se suman los puntos de las 3 afirmaciones de cada tipo (A, B, C, X, Y, Z).  
* Puntaje posible por bloque: 0 a 9\.

**6.2 Determinación de predominancia**

En cada bloque (A-B-C y X-Y-Z):

* Se identifica el tipo con mayor puntaje como predominante.  
* Si el segundo puntaje está a 2 puntos o menos, se considera un matiz secundario.  
* Si hay empate exacto, se declaran co-predominantes.  
* Si los tres puntajes están a 1 punto o menos, se comunica un perfil flexible.

---

**7\. Asignación de eneatipo**

La combinación del bloque predominante A-B-C con el bloque predominante X-Y-Z determina el eneatipo:

* A \+ X → Eneatipo 7 (El Entusiasta)  
* A \+ Y → Eneatipo 8 (El Líder)  
* A \+ Z → Eneatipo 3 (El Competitivo)  
* B \+ X → Eneatipo 9 (El Conciliador)  
* B \+ Y → Eneatipo 4 (El Creativo)  
* B \+ Z → Eneatipo 5 (El Analítico)  
* C \+ X → Eneatipo 2 (El Servicial)  
* C \+ Y → Eneatipo 6 (El Leal)  
* C \+ Z → Eneatipo 1 (El Reformador)

Si uno de los bloques es flexible o ambiguo, el resultado debe comunicarse como orientativo y exploratorio.

---

**8\. Presentación del resultado**

El resultado debe incluir:

* Eneatipo principal.  
* Texto breve de liderazgo (5 líneas).  
* Imagen simbólica (moneda dorada con animal correspondiente).  
* Mensaje aclaratorio: el eneatipo es un mapa, no una etiqueta.  
* Botón con enlace a sitio web externo para profundizar.

---

**9\. Requerimientos de diseño y UX**

* Diseño minimalista, limpio y visual.  
* Navegación intuitiva, sin fricción.  
* Uso claro de tipografía y espacios en blanco.  
* Experiencia rápida y responsive (desktop y móvil).  
* Lenguaje empoderador y no determinista.

---

**10\. Consideraciones finales**

La aplicación debe transmitir claridad, confianza y profundidad sin complejidad técnica visible para el usuario. El foco está en la experiencia emocional, la facilidad de uso y la coherencia ética del resultado.

