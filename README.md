# Meal Browser installatiehandleiding #

## Inhoud ##

* [Inleiding](#inleiding)
* [Installeren en starten](#installeren-en-starten)

## Inleiding ##

Meal Browser is een web applicatie die het mogelijjk maakt om naar recepten te zoeken.
Daartoe maakt Meal Browser gebruik van de spoonacular API.
Met deze API kan een grote hoeveelheid recepten worden doorzocht.  

Met de functionaliteit "eenvoudig zoeken" helpt Meal Browser de gebruiker om recepten te vinden op basis van een
zoekterm. Dit komt van pas om te zoeken naar een specifiek recept waarvan de naam grotendeels bekend is (zoals bij
zoekterm "chicken salad sandwich") of naar een categorie van recepten (zoals bij zoekterm "fruit salad").  

Met de functionaliteit "uitgebreid zoeken" kan de gebruiker een aantal criteria toepassen om te zoeken naar
recepten met de gewenste eigenschappen. Zo kan bijvoorbeeld worden gezocht naar een vegetarische salade uit de
Mediterraanse keuken die binnen 60  minuten bereid kan worden.

![Screenshot Uitgebeid zoeken naar recepten](images/ScreenshotMBUZ.GIF)

Ten slotte kan de gebruiker zich laten inspireren door een actueel overzicht van populaire recepten, die bij
menige tafelgast in de smaak zullen vallen.

## Installeren en starten ##

Volg de volgende stappen om Meal Browser te installeren en te starten.  
1. Clone dit project.
2. NPM, Parcel en Axios zijn al geconfigureerd. Geef om de bijbehorende dependencies te installeren het commando
`npm install`.
3. Wanneer NPM vulnerabilities rapporteert kunnen deze worden verholpen met `npm audit fix`. Volg hiervoor de
instructies.
4. De benodigde API key is al verwerkt in de code. Hiervoor is dus geen verdere actie nodig.
5. Geef om de applicatie te starten het commando `npm run start`.
