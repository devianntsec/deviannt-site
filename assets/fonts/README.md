# Fuentes

Tres fuentes variables en woff2, subset latín. Licencias en `LICENSES.txt`.

Para regenerar un archivo a partir del TTF variable original de Google Fonts / GitHub
(requiere `pip install fonttools brotli`):

    U="U+0020-007E,U+00A0-00FF,U+0131,U+0152-0153,U+02C6,U+02DA,U+02DC,U+2013-2014,U+2018-201E,U+2022,U+2026,U+2190-2193,U+20AC,U+2122,U+2212,U+2264"
    pyftsubset ORIGINAL.ttf --unicodes="$U" --flavor=woff2 \
      --layout-features='kern,liga,calt,ccmp,locl,mark,mkmk,case,tnum,zero' \
      --name-IDs=0,1,2,3,4,5,6,13,14 --no-hinting --desubroutinize --notdef-outline \
      --output-file=NOMBRE-latin.woff2

Si el sitio empieza a usar caracteres fuera de ese rango (otros alfabetos, ✓, etc.),
añádelos a `U` y regenera.
