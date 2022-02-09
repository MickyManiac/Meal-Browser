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
    // Voorkom dat de pagina na een submit meteen ververst en alle geinjecteerde resulaten verdwijnen:
    evt.preventDefault();
    // Verwijder eventuele overblijfselen van een vorige zoekopdracht.
    helpTextElement.innerHTML = ``;
    resultsElement.innerHTML = `Zoekopdracht wordt uitgevoerd...`;
    selectedResultElement.innerHTML = ``;
    // Neem het tekstveld element.
    const textFieldElement = document.getElementById(`text-query-field`);
    if (validateText(textFieldElement.value)) {
        // Geef de ingevulde zoekterm aan de functie die de zoekopdracht uitvoert.
        await fetchData(textFieldElement.value);
    }
    // Maak het tekstveld weer leeg.
    textFieldElement.value = ``;
}

// Controleer of "text" een gelige zoekterm is en geef indien nodig gepast foutmeldingen.
function validateText(text) {
    let returnValue = false;
    if (!text)  {
        // Geen zoekterm ingevuld.
        helpTextElement.innerHTML = `Vul een zoekterm in.`;
        resultsElement.innerHTML = ``;
    } else if (!alphaNumeric(text))  {
        // Geen geldige zoekterm ingevuld
        helpTextElement.innerHTML = `Geen geldige zoekterm. Vul alleen letter of cijfers in.`;
        resultsElement.innerHTML = ``;
    } else {
        returnValue = true;
    }
    return returnValue;
}

// Controleer of de tekens van "str" zijn toegestaan.
// To do: ook umlaut letters etc, ook verbindingsteken, spatie, geen ?&=<>/;, wel ,.-_
function alphaNumeric(str) {
    for (let i = 0; i < str.length; i++) {
        let code = str.charCodeAt(i);
        if (!(code > 47 && code < 58) && // numeric (0-9)
            !(code > 64 && code < 91) && // upper alpha (A-Z)
            !(code > 96 && code < 123)) { // lower alpha (a-z)
            return false;
        }
    }
    return true;
}

// Probeer externe data op te halen die ovreenkomen met de zoekopdracht.
async function fetchData(searchString) {
    // alert(`function call fetchData(${searchString}) !`);
    // Probeer externe data op te halen.
    try {
        // Doe een spoonacular request met searchString als zoekterm.
        // Vraag voor nu om slechts 1 recept.
        // Ontvang de response in variabele response.
        const response = await axios.get(`https://api.spoonacular.com/recipes/complexSearch?query=${searchString}&number=1&apiKey=ada1ef8535a14d7695ff0ba52516335a`);
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
                resultsElement.innerHTML = `
                   <hr>
                   <div class="resultbox" onclick="fetchRecipe(${receivedResults[0].id})">
                       <div>${receivedResults[0].id}</div>
                       <div>${receivedResults[0].title}</div>
                       <div><img  alt="${receivedResults[0].title}" src="${receivedResults[0].image}"></div>
                   </div>
                   <hr>
                `;
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
