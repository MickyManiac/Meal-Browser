import axios from 'axios';

async function fetchData() {
    try {
        // alert('function fetchData() is being called!');
        let htmlString;
        const result = await axios.get('https://api.spoonacular.com/recipes/complexSearch?query=pizza&number=1&apiKey=ada1ef8535a14d7695ff0ba52516335a');
        console.log(result);
        htmlString = '<hr><div>' + result.data.results[0].id + '</div><div>' +
            result.data.results[0].title +
            '</div><div><img  alt="' + result.data.results[0].title + '" src="' + result.data.results[0].image + '"></div>';
           document.getElementById('searchresults').innerHTML = htmlString;
    } catch(err) {
        console.error(err);
    }
}
fetchData();
