import axios from 'axios';

// Plaats een submit event listener op het form element
document.getElementById(`simple-search-form`).addEventListener("submit", handleTextQuery);

// Neem de elementen waarin html fragmenten geinjecteerd gaan worden.
const helpTextElement = document.getElementById(`simple-search-help-text`);
const resultsElement = document.getElementById(`searchresults`);
let galleryElement = null;
const selectedResultElement = document.getElementById(`selectedresult`);

// Verwerk de zoekopdracht.
async function handleTextQuery(evt) {
    // alert(`function handleTextQuery() is being called!`);
    // Voorkom dat de pagina na een submit meteen ververst en alle geinjecteerde resulaten verdwijnen.
    evt.preventDefault();
    // Verwijder eventuele overblijfselen van een vorige zoekopdracht.
    helpTextElement.innerHTML = ``;
    resultsElement.innerHTML = ``;
    selectedResultElement.innerHTML = ``;
    // Neem het tekstveld element.
    const textFieldElement = document.getElementById(`text-query-field`);
    if (validTextQuery(textFieldElement.value)) {
        // Geef de ingevulde zoekterm aan de functie die de zoekopdracht uitvoert.
        await fetchData(textFieldElement.value);
    }
    // Maak het tekstveld weer leeg.
    textFieldElement.value = ``;
}

// Controleer of "text" een geldige zoekterm is en geef indien nodig gepaste foutmeldingen.
function validTextQuery(text) {
    let returnValue = false;
    if (!text)  {
        // Geen zoekterm ingevuld.
        helpTextElement.innerHTML = `Vul een zoekterm in.`;
    } else if (!validCharacters(text))  {
        // Geen geldige zoekterm ingevuld
        helpTextElement.innerHTML = `<span class="quoted">${text}</span> is geen geldige zoekterm. Toegestaan zijn: alle letters, de tekens <span class="symbol">"</span> <span class="symbol">&</span> <span class="symbol">(</span> <span class="symbol">)</span> <span class="symbol">+</span> <span class="symbol">-</span> en spaties.`;
    } else {
        returnValue = true;
    }
    return returnValue;
}

// Controleer of de tekens van "text" zijn toegestaan in een zoekterm.
// Zie https://en.wikipedia.org/wiki/List_of_Unicode_characters
//   (32 <= code <= 48) => ASCII punctuation and symbols: <space>!"#$%&'()*+,-./
//   (48 <= code <= 57) => ASCII digits: 0-9
//   (58 <= code <= 64) => Latin punctuation and symbols: :;<=>?@
//   (65 <= code <= 90) => Latin alphabet uppercase: (A-Z)
//   (91 <= code <= 96) => Latin punctuation and symbols: [\]^_`
//   (97 <= code <= 122) => Latin alphabet lowercase: (a-z)
//   (123 <= code <= 126) => Latin punctuation and symbols: {|}~
//   (192 <= code <= 214) => More uppercase letters, like latin capital letter N with tilde
//   (216 <= code <= 222) => More uppercase letters, like latin capital Letter U with diaeresis
//   (223 <= code <= 246) => More lowercase letters, like Latin small letter n with tilde
//   (248 <= code <= 255) => More lowercase letters, like Latin small letter u with diaeresis
// Toegestaan zijn karakters met een code in het bereik: 65 <= code <= 90, 97 <= code <= 122, 192 <= code <= 255
// Dit zijn de hoofd- en kleine letters (ook vanaf niet-Nederlandse toetsenborden).
// Toegestaan zijn ook de karakters <space>"&()+-
function validCharacters(text) {
    for (let i = 0; i < text.length; i++) {
        let code = text.charCodeAt(i);
        if (!( (code >= 65 && code <= 90) || (code >= 97 && code <= 122) || (code >= 192 && code <= 255) ||
            text.charAt(i) === ' ' || text.charAt(i) === '"' || text.charAt(i) === '&' || text.charAt(i) === '(' ||
            text.charAt(i) === ')' || text.charAt(i) === '+' || text.charAt(i) === '-' )) {
            return false;
        }
    }
    return true;
}

// Het array waarin de resultaten zullen worden gezet
let receivedResults = null;

// Probeer externe data op te halen die overeenkomen met de zoekopdracht.
async function fetchData(searchString) {
    // alert(`function call fetchData(${searchString}) !`);
    // Geef gebruikersfeedback.
    resultsElement.innerHTML = `Zoekopdracht wordt uitgevoerd...`;
    // Probeer externe data op te halen.
    try {
        // Doe een spoonacular request met searchString als zoekterm.
        // Ontvang de response in variabele response.
        const response = await axios.get(`https://api.spoonacular.com/recipes/complexSearch?query=${searchString}&number=4&addRecipeInformation=true&apiKey=ada1ef8535a14d7695ff0ba52516335a`);
        // const response = await axios.get(`https://api.spoonacular.com/recipes/complexSearch?query=${searchString}&number=4&apiKey=ada1ef8535a14d7695ff0ba52516335a`);
        // Toon het resultaat in de console.
        console.log(response);
        // Zet het hier benodigde deel van de response in variabele receivedResults.
        receivedResults = response.data.results;
        // Controleer of er bruikbare resultaten zijn ontvangen
        if (!receivedResults) {
            // Geen resultaten ontvangen
            helpTextElement.innerHTML = `Er is helaas iets foutgegaan. Probeer het nog eens.`;
            resultsElement.innerHTML = ``;
        } else {
            if (receivedResults.length===0) {
                // Geen resultaten ontvangen
                helpTextElement.innerHTML = `Geen resultaten voor zoekterm ${searchString}.`;
                resultsElement.innerHTML = ``;
            } else {
                resultsElement.innerHTML = `
                    Resultaten voor zoekterm ${searchString}
                    <div id="gallery">Galerij</div>
                `;
                galleryElement = document.getElementById(`gallery`);

                // Injecteer de informatie uit het zoekresultaat als html.
                showResults(0);
            }
        }
    } catch(err) {
        console.error(err);
    }
}

// Hou bij welk resultaat op de eerste positie in de resultatengalerij staat.
let offset = 0;

// Schuif alle items een positie door, naar rechts
window.clickLeft = function() {
    offset -= 1;
    if (offset === -1) {
        offset = receivedResults.length-1;
    }
    showResults(offset);
}

// Schuif alle items een positie door, naar links
window.clickRight = function() {
    offset += 1;
    if (offset === receivedResults.length) {
        offset = 0;
    }
    showResults(offset);
}

// Toon de resultaten in een galerij met een bepaalde offset
function showResults(offset) {
    // Er passen maximaal 3 resultaten in de galerij.
    const gallerySize = 3;
    let nrItemsInGallery = gallerySize;
    if (receivedResults.length < gallerySize) {
        nrItemsInGallery = receivedResults.length;
    }
    // Bouw het html-fragment op.
    galleryElement.innerHTML = ``;
    // Pijl om door de resultaten te klikken.
    if (receivedResults.length > gallerySize) {
        galleryElement.innerHTML += `<div class="arrow" onclick="clickLeft()" onSelectStart="return false;">&lt;</div>`;
    }
    // Toon maximaal 3 resultaten in de galerij.
    for (let i=0; i<nrItemsInGallery; i++) {
        // Bepaal welk resultaat op deze positie in de galerij moet staan.
        let resultIndex = i+offset;
        if (resultIndex >= receivedResults.length) {
            resultIndex -= receivedResults.length;
        }
        // Verwerk de informatie uit het zoekresultaat in html fragmenten.
        // Receptnummer
        let idLine = `<div>---</div>`;
        if (receivedResults[resultIndex].id) {
            idLine = `<div>${receivedResults[resultIndex].id}</div>`;
        }
        // Receptnaam
        let titleLine = `<div class="recipename">Receptnaam niet gevonden.</div>`;
        if (receivedResults[resultIndex].title) {
            titleLine = `<div class="recipename">${receivedResults[resultIndex].title}</div>`;
        }
        // Afbeelding
        let imageLine = `<div class="imagebox"><img class="icon" alt="No food picture found." src="../images/NoImageFound.gif"></div>`;;
        if (receivedResults[resultIndex].image) {
            if (receivedResults[resultIndex].title) {
                imageLine = `<div class="imagebox"><img class="icon" alt="${receivedResults[resultIndex].title}" src="${receivedResults[resultIndex].image}"></div>`;
            } else {
                imageLine = `<div class="imagebox"><img class="icon" alt="" src="${receivedResults[resultIndex].image}"></div>`;
            }
        }
        // Bereidingstijd
        let readyTimeLine = `<div class="preparationtime">Bereidingstijd niet gevonden.</div>`;
        if (receivedResults[resultIndex].readyInMinutes) {
            readyTimeLine = `<div class="preparationtime">Bereidingstijd: ${receivedResults[resultIndex].readyInMinutes} minuten</div>`;
        }
        // Injecteer de informatie uit het zoekresultaat als html.
        galleryElement.innerHTML += `
                       <div class="resultbox" onclick="fetchRecipe(${receivedResults[resultIndex].id})">
                        ${idLine}
                        ${titleLine}
                        ${imageLine}
                        ${readyTimeLine}
                       </div>
                      `;
    }
    // Pijl om door de resultaten te klikken.
    if (receivedResults.length > gallerySize) {
        galleryElement.innerHTML += `<div class="arrow" onclick="clickRight()" onSelectStart="return false;">&gt;</div>`;
    }
    selectedResultElement.innerHTML = `<hr>`;
}

// Haal meer informatie op voor een specifiek recept
// Gebruik een vanwege parcel benodigde "workaround" om vanuit html met onclick deze functie te vinden.
//  Zie https://github.com/parcel-bundler/parcel/issues/3755
window.fetchRecipe = async function(recipeId) {
    // alert(`function call fetchRecipe(${recipeId}) !`);
    // Geef gebruikersfeedback.
    selectedResultElement.innerHTML = `<hr>Gegevens worden opgehaald.`;
    try {
        // Ontvang de response in variabele response.
        const response = await axios.get(`https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=ada1ef8535a14d7695ff0ba52516335a`);
        // Toon het resultaat in de console.
        console.log(response);
        // Zet het hier benodigde deel van de response in variabele receivedResult.
        const receivedResult = response.data;
        // Controleer of er een bruikbaar resultaat is ontvangen.
        if (!receivedResult) {
            // Geen resultaat ontvangen
            selectedResultElement.innerHTML = `<hr>Geen verdere informatie gevonden voor dit recept.`;
        } else {
            // Verwerk de informatie uit het zoekresultaat in html fragmenten.
            let titleSection = `<div class="recipetitle">Geen receptnaam gevonden.</div>`;
            if (receivedResult.title) {
                titleSection = `<div class="recipetitle">${receivedResult.title}</div>`;
            }
            // Afbeelding
            let imageSection = ``;
            if (receivedResult.image) {
                if (receivedResult.title) {
                    imageSection = `<div class="recipesection"><img class="recipeimage" alt="${receivedResult.title}" src="${receivedResult.image}"></div>`;
                } else {
                    imageSection = `<div class="recipesection"><img class="recipeimage" alt="" src="${receivedResult.image}"></div>`;
                }
            }
            // Bereidingstijd
            let readyTimeSection = `<div class="recipesection">Geen bereidingstijd gevonden voor dit recept.</div>`;
            if (receivedResult.readyInMinutes) {
                readyTimeSection = `<div class="recipesection">Bereidingstijd</div><div>${receivedResult.readyInMinutes} minuten</div>`;
            }
            // Aantal porties
            let nrServings = receivedResult.servings;
            // Ingredienten
            let ingredientsSection = `<div class="recipesection">Geen ingredi&euml;nten gevonden voor dit recept.</div>`;
            if (receivedResult.extendedIngredients && receivedResult.extendedIngredients.length > 0) {
                if (nrServings) {
                    if (nrServings === 1) {
                        ingredientsSection = `<div class="recipesection">Ingredi&euml;nten voor 1 portie</div><div>`;
                    }
                    if (nrServings > 1) {
                        ingredientsSection = `<div class="recipesection">Ingredi&euml;nten voor ${nrServings} porties</div><div>`;
                    }
                }
                else {
                    ingredientsSection = `<div class="recipesection">Ingredi&euml;nten</div><div>`;
                }
                for (let i=0; i<receivedResult.extendedIngredients.length; i++) {
                    ingredientsSection += `${receivedResult.extendedIngredients[i].original}<br>`;
                }
                ingredientsSection += `</div>`;
            } else if (receivedResult.sourceUrl) {
                ingredientsSection = `<div class="recipesection">Bekijk de ingredi&euml;nten voor dit recept op <a href="${receivedResult.sourceUrl}" target="_blank">${receivedResult.sourceUrl}</a>.</div>`;
            }
            // Bereidingswijze
            let instructionsSection = `<div class="recipesection">Geen bereidingswijze gevonden voor dit recept.</div>`;
            if (receivedResult.instructions) {
                instructionsSection = `<div class="recipesection">Bereidingswijze</div><div>${receivedResult.instructions}</div>`;
            } else if (receivedResult.sourceUrl) {
                instructionsSection = `<div class="recipesection">Bekijk de bereidingswijze voor dit recept op <a href="${receivedResult.sourceUrl}" target="_blank">${receivedResult.sourceUrl}</a>.</div>`;
            }
            // Externe link
            let sourceUrlSection = `<div class="recipesection">Geen externe link gevonden voor dit recept.</div>`;
            if (receivedResult.sourceUrl) {
                sourceUrlSection = `<div class="recipesection">Bron</div><div><a href="${receivedResult.sourceUrl}" target="_blank">${receivedResult.sourceUrl}</a></div>`;
            }
            // Injecteer de informatie uit het zoekresultaat als html.
            selectedResultElement.innerHTML = `
                <hr>
                ${titleSection}
                ${imageSection}
                ${readyTimeSection}
                ${ingredientsSection}
                ${instructionsSection}
                ${sourceUrlSection}
                <hr>
            `;
        }
        selectedResultElement.innerHTML += `<hr>`;
    } catch(err) {
        console.error(err);
    }
}
