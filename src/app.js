import axios from 'axios';

// Gebruik globale variabelen voor de elementen waarin html fragmenten geinjecteerd gaan worden.
let helpTextElement = null;
const resultsElement = document.getElementById(`search-results`);
let galleryElement = null;
const selectedResultElement = document.getElementById(`selectedresult`);

// Injecteer een overzicht van de meest populaire recepten op aanvraag van de betreffende pagina.
window.startMostPopular = async function() {
    document.getElementById(`searchform`).innerHTML = `
    <div id="form-help-text"></div>
  `;
    // Gebruik deze query om in een keer voor een reeks specifieke recepten informatie op te halen.
    let apiQueryString = `https://api.spoonacular.com/recipes/informationBulk?ids=715562,715419,715521,715495,715560,776505,715538,716429&apiKey=ada1ef8535a14d7695ff0ba52516335a`;
    let searchSummary = `"populaire recepten"`;
    // Geef de query en de samenvatting van de zoekopdracht aan de functie die de zoekopdracht uitvoert.
    await fetchData(apiQueryString, searchSummary);
}

// Injecteer het zoekformulier voor eenvoudig zoeken op aanvraag van de betreffende pagina.
window.startSimpleSearch = function() {
    document.getElementById(`searchform`).innerHTML = `
    <form id="simple-search-form">
        <fieldset>
            <label for="text-query-field">Vul een zoekterm in:</label>
            <input type="text" name="text-query" id="text-query-field" placeholder="bijv fruit salad">
            <button  type="submit">Zoeken</button>
        </fieldset>
        <div id="form-help-text"></div>
    </form>
  `;

    // Plaats een submit event listener op het form element
    document.getElementById(`simple-search-form`).addEventListener("submit", handleSimpleFormSubmit);

    // Ken aan globale variabele helpTextElement de bedoelde waarde toe.
    helpTextElement = document.getElementById(`form-help-text`);
}

// Injecteer het zoekformulier voor uitgebreid zoeken op aanvraag van de betreffende pagina.
window.startAdvancedSearch = function() {
    document.getElementById(`searchform`).innerHTML = `
    <form id="advanced-search-form">
        <fieldset>
            <label for="text-query-field">Vul een zoekterm in:</label>
            <input type="text" id="text-query-field" name="text-query" placeholder="bijv fruit salad"><br><br>
            <label for="preparation-time-field">Maximale bereidingstijd in minuten:</label>
            <input type="text" id="preparation-time-field" name="preparation-time" placeholder="bijv 30"><br><br>
                <label for="cuisine">Welke keuken?</label>
                <select id="cuisine-selection" name="cuisine">
                    <option value="No preference">No preference</option>
                    <option value="African">African</option>
                    <option value="American">American</option>
                    <option value="British">British</option>
                    <option value="Cajun">Cajun</option>
                    <option value="Caribbean">Caribbean</option>
                    <option value="Chinese">Chinese</option>
                    <option value="Eastern European">Eastern European</option>
                    <option value="European">European</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                    <option value="Greek">Greek</option>
                    <option value="Indian">Indian</option>
                    <option value="Irish">Irish</option>
                    <option value="Italian">Italian</option>
                    <option value="Japanese">Japanese</option>
                    <option value="Jewish">Jewish</option>
                    <option value="Korean">Korean</option>
                    <option value="Latin American">Latin American</option>
                    <option value="Mediterranean">Mediterranean</option>
                    <option value="Mexican">Mexican</option>
                    <option value="Middle Eastern">Middle Eastern</option>
                    <option value="Nordic">Nordic</option>
                    <option value="Southern">Southern</option>
                    <option value="Spanish">Spanish</option>
                    <option value="Thai">Thai</option>
                    <option value="Vietnamese">Vietnamese</option>
                </select><br><br>
                <label for="diet">Dieet:</label>
                <select id="diet-selection" name="diet">
                    <option value="None">None</option>
                    <option value="Gluten free">Gluten free</option>
                    <option value="Ketogenic">Ketogenic</option>
                    <option value="Vegan">Vegan</option>
                    <option value="Vegetarian">Vegetarian</option>
                </select><br><br>
            <button  type="submit">Zoeken</button>
            <button  type="reset">Reset</button>
        </fieldset>
        <div id="form-help-text"></div>
    </form>
  `;

    // Plaats een submit event listener op het form element
    document.getElementById(`advanced-search-form`).addEventListener("submit", handleAdvancedFormSubmit);

    // Ken aan globale variabele helpTextElement de bedoelde waarde toe.
    helpTextElement = document.getElementById(`form-help-text`);
}

// Verwerk de zoekopdracht voor eenvoudig zoeken.
async function handleSimpleFormSubmit(evt) {
    // Voorkom dat de pagina na een submit meteen ververst en alle geinjecteerde inhoud verdwijnt:
    evt.preventDefault();
    // Verwijder eventuele overblijfselen van een vorige zoekopdracht.
    helpTextElement.innerHTML = ``;
    resultsElement.innerHTML = ``;
    selectedResultElement.innerHTML = ``;

    //NEW
    let apiQueryString = `https://api.spoonacular.com/recipes/complexSearch?number=4&addRecipeInformation=true&apiKey=ada1ef8535a14d7695ff0ba52516335a`;
    let searchSummary = ``;

    // Valideer de waarde van het query tekstveld.
    // Neem het tekstveld element.
    const queryTextFieldElement = document.getElementById(`text-query-field`);
    const textQueryValue = queryTextFieldElement.value;
    if (validTextQuery(textQueryValue)) {
        apiQueryString += `&query=${textQueryValue}`;
        searchSummary += `zoekterm <span class="quoted">${textQueryValue}</span>`;
        // Geef de query en de samenvatting van de zoekopdracht aan de functie die de zoekopdracht uitvoert.
        await fetchData(apiQueryString, searchSummary);
    }

    // Maak het tekstveld NIET weer leeg.
    // queryTextFieldElement.value = ``;
}

// Verwerk de zoekopdracht voor uitgebreid zoeken.
async function handleAdvancedFormSubmit(evt) {
    // Voorkom dat de pagina na een submit meteen ververst en alle geinjecteerde inhoud verdwijnt:
    evt.preventDefault();
    // Verwijder eventuele overblijfselen van een vorige zoekopdracht.
    helpTextElement.innerHTML = ``;
    resultsElement.innerHTML = ``;
    selectedResultElement.innerHTML = ``;
    // Initialiseer de API query en een tekstuele samenvatiing van de zoekopdracht.
    let apiQueryString = `https://api.spoonacular.com/recipes/complexSearch?number=5&addRecipeInformation=true&apiKey=ada1ef8535a14d7695ff0ba52516335a`;
    let searchSummary = ``;
    let validInput = true;

    // Valideer de waarde van het query tekstveld.
    // Neem het tekstveld element.
    const queryTextFieldElement = document.getElementById(`text-query-field`);
    const textQueryValue = queryTextFieldElement.value;
    if (validTextQuery(textQueryValue)) {
        apiQueryString += `&query=${textQueryValue}`;
        searchSummary += `zoekterm <span class="quoted">${textQueryValue}</span>`;
    } else {
        validInput = false;
    }

    // Valideer de waarde van het preparation-time tekstveld.
    // Neem het tekstveld element.
    const preparationTimeTextFieldElement = document.getElementById(`preparation-time-field`);
    const preparationTimeValue = preparationTimeTextFieldElement.value;
    if (isPositiveNumber(preparationTimeValue)) {
        // isPositiveNumber is ook true voor een lege string, maar een lege string hoeft niet te worden ingevuld in de api query
        if (preparationTimeValue) {
            apiQueryString += `&maxReadyTime=${preparationTimeValue}`;
            searchSummary += `, maximale bereidingstijd <span class="quoted">${preparationTimeValue}</span> minuten`;
        }
    } else {
        // Ongeldige bereidingstijd ingevuld
        if (helpTextElement.innerHTML) {
            helpTextElement.innerHTML += `<br>`;
        }
        helpTextElement.innerHTML += `<span class="quoted">${preparationTimeValue}</span> is geen geldige bereidingstijd. Toegestaan zijn alleen cijfers.`;
        validInput = false;
    }

    // Valideer de waarde van de cuisine selectie.
    // Neem het selectie element.
    const cuisineSelectionElement = document.getElementById(`cuisine-selection`);
    const cuisineValue = cuisineSelectionElement.value;
    if (cuisineValue != `No preference`) {
        apiQueryString += `&cuisine=${cuisineValue}`;
        searchSummary += `, keuken <span class="quoted">${cuisineValue}</span>`;
    }

    // Valideer de waarde van de diet selectie.
    // Neem het selectie element.
    const dietSelectionElement = document.getElementById(`diet-selection`);
    const dietValue = dietSelectionElement.value;
    if (dietValue != `None`) {
        apiQueryString += `&diet=${dietValue}`;
        searchSummary += `, dieet <span class="quoted">${dietValue}</span>`;
    }

    if (validInput) {
        // Geef de query en de samenvatting van de zoekopdracht aan de functie die de zoekopdracht uitvoert.
        await fetchData(apiQueryString, searchSummary);
    }

    // Maak de tekstvelden NIET weer leeg (zodat ht eenvoudiger is om een nieuwe, aangepaste zoekopdracht uit te voeren).
    // queryTextFieldElement.value = ``;
    // preparationTimeTextFieldElement.value = ``;
}

// ******** VANAF HIER : GEMEENSCHAPPELIJKE CODE VOOR EENVOUDIG EN UITGEBREID ZOEKEN ********

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

// Controleer of "text" een positief getal vertegenwoordigt.
// Toegestaan zijn de karakters met een code in het bereik: (48 <= code <= 57)
function isPositiveNumber(text) {
    for (let i = 0; i < text.length; i++) {
        let code = text.charCodeAt(i);
        if (code < 48 || code > 57) {
            return false;
        }
    }
    return true;
}

// Het array waarin de resultaten zullen worden gezet
let receivedResults = null;

// Probeer externe data op te halen die overeenkomen met de zoekopdracht.
async function fetchData(apiQueryString, searchSummary) {
    // Geef gebruikersfeedback.
    resultsElement.innerHTML = `Zoekopdracht wordt uitgevoerd...`;
    // Probeer externe data op te halen.
    try {
        // Doe een spoonacular request met apiQueryString.
        // Ontvang de response in variabele response.
        const response = await axios.get(apiQueryString);
        // const response = await axios.get(`https://api.spoonacular.com/recipes/complexSearch?query=${searchString}&number=4&apiKey=ada1ef8535a14d7695ff0ba52516335a`);
        // Toon het resultaat in de console.
        console.log(response);
        // Zet het hier benodigde deel van de response in variabele receivedResults.
        // De strutuur van de response is afhankelijk van het gebruikte endpoint.
        if (response.data.results) {
            receivedResults = response.data.results;
        } else if (response.data) {
            receivedResults = response.data;
        }
        // Controleer of er bruikbare resultaten zijn ontvangen
        if (!receivedResults) {
            // Geen resultaten ontvangen
            helpTextElement.innerHTML = `Er is helaas iets foutgegaan. Probeer het nog eens.`;
            resultsElement.innerHTML = ``;
        } else {
            if (receivedResults.length===0) {
                // Geen resultaten ontvangen
                helpTextElement.innerHTML = `Geen resultaten voor ${searchSummary}.`;
                resultsElement.innerHTML = ``;
            } else {
                resultsElement.innerHTML = `
                    <div id="results-feedback">Resultaten voor ${searchSummary}:</div>
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
        const {id, title, image, readyInMinutes, aggregateLikes} = receivedResults[resultIndex];
        // Receptnummer
        let idLine = `<div class="no-recipe-id">---</div>`;
        if (id) {
            idLine = `<div class="recipeid">${id}</div>`;
        }
        // Receptnaam
        let titleLine = `<div class="no-recipe-name">Receptnaam niet gevonden.</div>`;
        if (title) {
            titleLine = `<div class="recipe-name">${title}</div>`;
        }
        // Afbeelding
        let imageLine = `<div class="image-box"><img class="icon" alt="No food picture found." src="../images/NoImageFound.gif"></div>`;;
        if (image) {
            if (title) {
                imageLine = `<div class="image-box"><img class="icon" alt="${title}" src="${image}"></div>`;
            } else {
                imageLine = `<div class="image-box"><img class="icon" alt="" src="${image}"></div>`;
            }
        }
        // Bereidingstijd
        let readyTimeLine = `<div class="no-preparation-time">Bereidingstijd niet gevonden.</div>`;
        if (readyInMinutes) {
            readyTimeLine = `<div class="preparation-time">Bereidingstijd: ${readyInMinutes} minuten</div>`;
        }
        // Populariteit
        let popularityLine = `<div class="no-popularity">Aantal likes niet gevonden.</div>`;
        if (aggregateLikes) {
            popularityLine = `<div class="popularity">${aggregateLikes} likes</div>`;
        }

        // Injecteer de informatie uit het zoekresultaat als html.
        galleryElement.innerHTML += `
                       <div class="result-box" onclick="fetchRecipe(${id})">
                        ${idLine}
                        ${titleLine}
                        ${imageLine}
                        ${readyTimeLine}
                        ${popularityLine}
                       </div>
                      `;
    }
    // Pijl om door de resultaten te klikken.
    if (receivedResults.length > gallerySize) {
        galleryElement.innerHTML += `<div class="arrow" onclick="clickRight()" onSelectStart="return false;">&gt;</div>`;
    }
}

// Haal meer informatie op voor een specifiek recept
// Gebruik een vanwege parcel benodigde "workaround" om vanuit html met onclick deze functie te vinden.
//  Zie https://github.com/parcel-bundler/parcel/issues/3755
window.fetchRecipe = async function(recipeId) {
    // Geef gebruikersfeedback.
    selectedResultElement.innerHTML = `Gegevens worden opgehaald.`;
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
            selectedResultElement.innerHTML = `Geen verdere informatie gevonden voor dit recept.`;
        } else {
            // Verwerk de informatie uit het zoekresultaat in html fragmenten.
            const {title, aggregateLikes, image, readyInMinutes, servings, extendedIngredients, sourceUrl, instructions} = receivedResult;
            // Receptnaam
            let titleSection = `<div class="no-recipe-title">Geen receptnaam gevonden.</div>`;
            if (title) {
                titleSection = `<div class="recipe-title">${title}</div>`;
            }
            // Populariteit
            // Toon hiervoor geen melding als deze informatie niet aanwezig is
            let popularitySection = ``;
            if (aggregateLikes) {
                popularitySection = `<div class="recipe-section">${aggregateLikes} likes</div>`;
            }
            // Afbeelding
            let imageSection = ``;
            if (image) {
                if (title) {
                    imageSection = `<div class="recipe-section"><img class="recipe-image" alt="${title}" src="${image}"></div>`;
                } else {
                    imageSection = `<div class="recipe-section"><img class="recipe-image" alt="" src="${image}"></div>`;
                }
            }
            // Bereidingstijd
            let readyTimeSection = `<div class="empty-recipe-section">Geen bereidingstijd gevonden voor dit recept.</div>`;
            if (readyInMinutes) {
                readyTimeSection = `<div class="recipe-section">Bereidingstijd</div><div>${readyInMinutes} minuten</div>`;
            }
            // Aantal porties
            let nrServings = servings;
            // Ingredienten
            let ingredientsSection = `<div class="empty-recipe-section">Geen ingredi&euml;nten gevonden voor dit recept.</div>`;
            if (extendedIngredients && extendedIngredients.length > 0) {
                if (nrServings) {
                    if (nrServings === 1) {
                        ingredientsSection = `<div class="recipe-section">Ingredi&euml;nten voor 1 portie</div><div>`;
                    }
                    if (nrServings > 1) {
                        ingredientsSection = `<div class="recipe-section">Ingredi&euml;nten voor ${nrServings} porties</div><div>`;
                    }
                }
                else {
                    ingredientsSection = `<div class="recipe-section">Ingredi&euml;nten</div><div>`;
                }
                for (let i=0; i<extendedIngredients.length; i++) {
                    ingredientsSection += `${extendedIngredients[i].original}<br>`;
                }
                ingredientsSection += `</div>`;
            } else if (sourceUrl) {
                ingredientsSection = `<div class="recipe-section">Ingredi&euml;nten</div><div>Bekijk de ingredi&euml;nten voor dit recept op <a href="${sourceUrl}" target="_blank">${sourceUrl}</a>.</div>`;
            }
            // Bereidingswijze
            let instructionsSection = `<div class="empty-recipe-section">Geen bereidingswijze gevonden voor dit recept.</div>`;
            if (instructions) {
                instructionsSection = `<div class="recipe-section">Bereidingswijze</div><div>${instructions}</div>`;
            } else if (sourceUrl) {
                instructionsSection = `<div class="recipe-section">Bereidingswijze</div><div>Bekijk de bereidingswijze voor dit recept op <a href="${sourceUrl}" target="_blank">${sourceUrl}</a>.</div>`;
            }
            // Externe link
            let sourceUrlSection = `<div class="empty-recipe-section">Geen externe link gevonden voor dit recept.</div>`;
            if (sourceUrl) {
                sourceUrlSection = `<div class="recipe-section">Bron</div><div><a href="${sourceUrl}" target="_blank">${sourceUrl}</a></div>`;
            }
            // Injecteer de informatie uit het zoekresultaat als html.
            selectedResultElement.innerHTML = `
                <article class="recipe-details">
                 ${titleSection}
                 ${popularitySection}
                 ${imageSection}
                 ${readyTimeSection}
                 ${ingredientsSection}
                 ${instructionsSection}
                 ${sourceUrlSection}
                </article>
            `;
        }
    } catch(err) {
        console.error(err);
    }
}
