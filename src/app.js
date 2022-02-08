import axios from 'axios';

// Plaats een event listener op het ... element
document.getElementById('zoektermknop').addEventListener("click", handleClick);

function handleClick() {
    // alert('function processClick() is being called!');
    fetchData(getSearchString())
}

function getSearchString() {
    // alert('function getSearchString() is being called!');
    return document.getElementById('zoekterm').value;
}

async function fetchData(searchString) {
    try {
        // alert('function fetchData() is being called!');
        let htmlString;
        if (searchString) {
            const result = await axios.get('https://api.spoonacular.com/recipes/complexSearch?query='+searchString+'&number=1&apiKey=ada1ef8535a14d7695ff0ba52516335a');
            if (result.data.results.length===0) {
                htmlString = 'Geen resultaten voor zoekterm '+searchString+'.';
            } else {
                htmlString = '<hr><div>' + result.data.results[0].id + '</div><div>' +
                    result.data.results[0].title +
                    '</div><div><img  alt="' + result.data.results[0].title + '" src="' + result.data.results[0].image + '"></div><hr>';
                // temporary - must be triggered by clicking a result box
                await fetchRecipe(result.data.results[0].id);
            }
            console.log(result);
            document.getElementById('searchresults').innerHTML = htmlString;
        } else {
            document.getElementById('searchhelp').innerHTML = 'Vul een zoekterm in.';
        }
    } catch(err) {
        console.error(err);
    }
}

// fetch detailed information for a specific recipe
async function fetchRecipe(recipeId) {
    alert('function call fetchRecipe('+recipeId+')!');
    try {
        let htmlString;
        const result = await axios.get('https://api.spoonacular.com/recipes/'+recipeId+'/information?apiKey=ada1ef8535a14d7695ff0ba52516335a');
        htmlString = '<a href="'+result.data.sourceUrl+'" target=”_blank”>'+result.data.sourceUrl+'</a><hr>';
        console.log(result);
        document.getElementById('selectedresult').innerHTML = htmlString;
    } catch(err) {
        console.error(err);
    }
}
