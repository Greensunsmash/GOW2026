# Contenu de Marco Robo : À la recherche du démarreur cosmique perdu

**Attention : cette partie contient des spoilers et doit être lu après avoir joué au jeu**

Ce fichier a pour but de présenter presque exhaustivement le jeu. Nous vous invitons d'abord a découvrir le jeu, le document [introduction](/introduction.md) est à votre disposition pour cela
Cette présentation détaillera les concepts de gameplay du jeu, l'aspect visuel, quelques aspects techniques et enfin le level design.


## Gameplay ##

__Marco Robo : À la recherche du démarreur cosmique perdu__ est un jeu s'inspirant de la programmation visuelle pour mettre en scène des puzzles originaux et divertissants.
Ces puzzles sont articulés autour de plusieurs mécaniques. 

### Les bases ###
Le but d'un niveau est toujours d'atteindre l'arrivée. Il faut donc analyser l'île, déterminer comment atteindre l'arrivée et esquiver les obstacles et le programmer à l'aide d'instructions basiques de mouvements ainsi que de structures de contrôles. Afin de pimenter ce concept, nous avons introduits les débris. Ce sont des débris de la fusée, que vous devez ramasser afin de reconstituer la fusée.
Vous avez également à votre disposition des capteurs, permettant de détecter si vous êtes face à un obstacle ou sur un débris.

Ces premières idées constituent déjà un socle conséquents, mais nous voulions ajouter encore plus de diveristé dans les niveaux

### Les cochons, les vraies stars du jeu ###

Nous introduisons donc un "ennemi", les cochons. Ceux ci ont un comportement simples, ils se déplacent en ligne droite, et font demi toutr si ils arrivent face à un obstacle. Ils se déplacent après chaque action du joueur, il faut donc prédire leur mouvements afin de les esquiver. Cela complète très bien les mécaniques déjà introduites et permet une palette variée de niveaux.
Mais nous voulions aller encore plus loin. Et la meilleure façon est de cassser les règles de programmation habituelles. Ainsi, votre programme peut-être modifié pendant l'exécution, en vous transformant en cochon. Vous adoptez alors pour 3 tours le comportements d'un cochon, détaillé plus haut, avant de revenir à votre programme originel.

Bien que nous avions d'autres idées, cela constitue déjà un solide socle de mécaniques, exploités par 21 niveaux soigneusement concus. Pour voir que quel manière nous faison cela, vous pouvez lire la partie level design en bas de ce document.


## Visuels ##

Beaucoup d'efforts ont été fait sur les visuels, et l'aspect actuel n'est que le résultat d'expérimentations afin de trouver les meilleurs dosages.

### Langage visuel ###

C'est l'élément essentiel du jeu, nous devions donc y mettre beaucoup de soin. Nous avons choisi un design le plus simple possible, avec des couleurs pastels afin de donner au jeu un coté paisible et mignon. Vous disposez à gauche d'un menu pour choisir vos blocs, séparé en différentes catégories, et un canvas redimensionnable pour faire vos programmes. Le but est d'être le plus clair possible, et dans l'intervalle de temps que nous avons eu, nous pensons avoir réussi ce challenge. Les programmes sont une listes d'instructions, indenté et encadré lorsque nous utilison des structures de controles, afin que ce soit facilement identifiables. Les instructions sont agrémentés de symboles afin de rendre le tout plus visuels et agréable à l'oeil.

### Îles ###

Les îles sont constitués de modèles 3D majoritairement fait ou modifiés par nous. 
Il y a 2 mondes, avec des idnetités visuelles (et sonores) bien distinctes.
Quelques assets libres de droits complètent le tout. Mais cela n'était pas suffisant à nos yeux. Ainsi, nous avons voulu rajouter une eau un peu plus réalistes, une skybox plus détaillé afin d'avoir un ensemble agréable à l'oeil tout en restant compréhensibles. Nous avons aussi un système d'ombres pour donner plus de profondeur au tout.

La cover quant à elle a été faite par Monjara12, nous le remercions fortement pour cette belle illustration.

Pour montrer les progrès, voici une capture du jeu pas si vieille que ça ;)
![Capture d'écran](/assets/images/old.png)

## Technique ##

### Développement d'un langage executable à la volée ###

Nous avons developpé exprès pour ce jeu un langage de programmation, d'abord prototypé en Java, puis implémenté en Typescript. Il y avait plusieurs grosse contraintes a respecter lors du développement. 
- Il doit implémenter la plupart des options classiques des langages de programmation habituels
- Il faut pouvoir éxecuter le programme pas par pas
- Il faut pouvoir revenir en arrière à tout moment ou bien mettre en pause

Nous sommes donc fiers de dire que nous avons réussi à faire tout cela. C'était une grande étape, dont dépendait tout le jeu.
Une partie du langage n'a d'ailleurs pas été utilisé dans le jeu. En particulier, le jeu gère parfaitement les fonctions mais finalement, nous avons chois de ne pas les inclure afin de pouvoir se concentrer sur d'autres mécaniques et de ne pas noyer le joueur.

### Repousser les limites de BabylonGUI ###

Avoir un langage fonctionnel c'est bien mais cela ne sert pas à grand chose si on ne peut l'utiliser. Il nous fallait donc le représenter visuellement, ce que nous avont fait exclusivement à l'aide de Babylon GUI. Ce fut long et éprouvant, mais nous avons finalement réussi à avoir une représentation jolie, mais également ergonomique. Le fonctionnement est basé sur des ListContainers, contenant une liste d'instructions, que nous pouvons séparer et fusionner à notre guise.

Le tout tourne sans lag, ce qui reste une condition essentielle pour le confort de jeu.


## Level design ##

Un soin particulier a été mis sur le level design. En effet, cela est le point central du jeu. Les niveaux ont été murement réfléchis afin d'exploiter et de mettre en valeur le gameplay. C'est un point crcucial que nous voulons mettre en valeur. Nous avons effectués de nombreux playtest qui nous ont beaucoup aidés a déceler des problèmes dans les niveaux, des bugs ou des soucis d'ergonomie. Tout ce processus fut long, mais a permis a jeu de devenir encore meilleur et nous remercions les personnes qui ont accordé de leur temps.
Si vous voulez voir une présentation concise de la structure du jeu, vous pouvez aller voir le document [levelDesign.md](/levelDesign.md).


