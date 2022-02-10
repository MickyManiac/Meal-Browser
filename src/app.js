import axios from 'axios';

// Plaats een submit event listener op het form element
document.getElementById(`simple-search-form`).addEventListener("submit", handleTextQuery);

// Neem de elementen waarin html fragmenten geinjecteerd gaan worden.
const helpTextElement = document.getElementById(`simple-search-help-text`);
const resultsElement = document.getElementById(`searchresults`);
const selectedResultElement = document.getElementById(`selectedresult`);

// Verwerk de zoekopdracht.
async function handleTextQuery(evt) {
    // alert(`function handleTextQuery() is being called!`);
    // Voorkom dat de pagina na een submit meteen ververst en alle geinjecteerde resulaten verdwijnen.
    evt.preventDefault();
    // Verwijder eventuele overblijfselen van een vorige zoekopdracht.
    helpTextElement.innerHTML = ``;
    resultsElement.innerHTML = `Zoekopdracht wordt uitgevoerd...`;
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
        resultsElement.innerHTML = ``;
    } else if (!validCharacters(text))  {
        // Geen geldige zoekterm ingevuld
        helpTextElement.innerHTML = `<span class="quoted">${text}</span> is geen geldige zoekterm. Toegestaan zijn: alle letters, de tekens <span class="symbols">" & ( ) + -</span> en spaties.`;
        resultsElement.innerHTML = ``;
    } else {
        returnValue = true;
    }
    return returnValue;
}

// Controleer of de tekens van "str" zijn toegestaan in een zoekterm.
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
function validCharacters(str) {
    for (let i = 0; i < str.length; i++) {
        let code = str.charCodeAt(i);
        if (!( (code >= 65 && code <= 90) || (code >= 97 && code <= 122) || (code >= 192 && code <= 255) ||
            str.charAt(i) === ' ' || str.charAt(i) === '"' || str.charAt(i) === '&' || str.charAt(i) === '(' ||
            str.charAt(i) === ')' || str.charAt(i) === '+' || str.charAt(i) === '-' )) {
            return false;
        }
    }
    return true;
}

// Probeer externe data op te halen die overeenkomen met de zoekopdracht.
async function fetchData(searchString) {
    // alert(`function call fetchData(${searchString}) !`);
    // Probeer externe data op te halen.
    try {
        // Doe een spoonacular request met searchString als zoekterm.
        // Vraag voor nu om maximaal 2 recepten.
        // Ontvang de response in variabele response.
        // const response = await axios.get(`https://api.spoonacular.com/recipes/complexSearch?query=${searchString}&number=1&addRecipeInformation=true&apiKey=ada1ef8535a14d7695ff0ba52516335a`);
        const response = await axios.get(`https://api.spoonacular.com/recipes/complexSearch?query=${searchString}&number=2&apiKey=ada1ef8535a14d7695ff0ba52516335a`);
        // Toon het resultaat in de console.
        console.log(response);
        // Zet het hier benodigde deel van de response in variabele receivedResults.
        const receivedResults = response.data.results;
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
                // Injecteer de informatie uit het zoekresultaat als html.
                // Er passen maximaal 3 resultaten in de galerij.
                let gallerySize = 3;
                if (receivedResults.length < 3) {
                    gallerySize = receivedResults.length;
                }
                resultsElement.innerHTML = ``;
//                    if (receivedResults.length > 3) {
                resultsElement.innerHTML += `<div class="arrow">&lt;</div>`;
//                    }
                for (let i=0; i<gallerySize; i++) {
                    resultsElement.innerHTML += `
                       <div class="resultbox" onclick="fetchRecipe(${receivedResults[i].id})">
                        <div>${receivedResults[i].id}</div>
                        <div class="recipename">${receivedResults[i].title}</div>
                        <div class="imagebox"><img class="icon" alt="${receivedResults[i].title}" src="${receivedResults[i].image}"></div>
                        <div class="preparationtime">Bereidingstijd:</div>
                       </div>
                      `;
                }
//                    if (receivedResults.length > 3) {
                resultsElement.innerHTML += `
                       <div class="arrow">&gt;</div>
                      `;
//                    }
            }
        }
    } catch(err) {
        console.error(err);
    }
}

// Haal meer informatie op voor een specifiek recept
// Gebruik een vanwege parcel benodigde "workaround" om vanuit html met onclick deze functie te vinden.
//  Zie https://github.com/parcel-bundler/parcel/issues/3755
window.fetchRecipe = async function(recipeId) {
    // alert(`function call fetchRecipe(${recipeId}) !`);
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
            selectedResultElement.innerHTML = `Geen verdere  informmatie gevonden voor dit recept.`;
        } else if (receivedResult.sourceUrl) {
            // Injecteer de informatie uit het zoekresultaat als html.
            selectedResultElement.innerHTML = `
                <a href="${receivedResult.sourceUrl}" target=”_blank”>${receivedResult.sourceUrl}</a>
                <hr>
            `;
        } else {
            selectedResultElement.innerHTML = `Geen externe link gevonden voor dit recept.`;
        }
    } catch(err) {
        console.error(err);
    }
}
