# TP dév avance Nathan Randriantsoa

## Init du projet nest
### conflit de compilation de module et resolution de module

problème : depiuis les version recente de node, le nest cli creer des projet typeScript moderne avec de la relosution de module 
`esm`, `nodenext` pour une creation d'un projet moderne. Nest JS à été initialement concu en mode `commonJS` que se soit pour le declaration et compilation de module ainsi que la résolution de module. Ce qui entraine par conséquent (avec vs code et quelque configuration de node) des erreur de resolution de module node et donc de compilation. 

Pour resoudre ce problème, et offrir un environnement stable qui marcherai sur n'importe quelle machine. J'ai modifier le fichier .ts pour utilise `commonJS` pour la résolution de module. 

