# Setting x, y and zoom level in url to retain map view

When you zoom in on a particular location on a map, you sometimes wish you could retain that map view, e.g. to share it with someone else. That's why we were looking for a way to get the x, y and zoom level from the search parameters in our url. But not only do we want to be able to read the values from the query string (i.e. everything behind the question mark), we also want to be able to set them, and to modify them whenever the map view changes, i.e. when the user pans and zooms around on the map.

Below is a description of the functionality we use to grab the x an y coordinates (in British National Grid, rounded to the full meter) and to modify the url.

# URLSearchParams and History.replaceState()

The [URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) interface defines utility methods to work with the query string of a URL. In the example below we use the following methods of this interface:

  * The [has()](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams/has) method indicates whether a parameter with the specified name exists
  * The [get()](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams/get) method returns the (first) value associated to the given search parameter
  * The [set()](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams/set) method sets the value associated with a given search parameter. And very important: if the search parameter does not yet exist (which might initially be the case), this method will create the search parameter.

The [History.replaceState()](https://developer.mozilla.org/en-US/docs/Web/API/History/replaceState) method modifies the current history entry. This method is particularly useful when you want to update the URL of the current history entry in response to some user action, e.g. the panning and zooming mentioned before.

# And this is how it works:

If you provide [the url without any parameters](https://twiav.github.io/WebMaps/URLSearchParams/arcgis_javascript_with_uk_data_url_parameters.htm), you will start at the Default map view. But as you will see, the default parameters are added immediately to the address bar:

https://twiav.github.io/WebMaps/URLSearchParams/arcgis_javascript_with_uk_data_url_parameters.htm

And as soon as you start zooming and panning around, these parameters will be adjusted every time the view becomes "stationary".

In this way, you can zoom in to a particular spot and copy the url to make sure to share exactly that map view.

If you click on the link below you will immediately end up in Steòrnabhagh  (or Stornoway), on the island of Lewis and Harris in the Outer Hebrides:

https://twiav.github.io/WebMaps/URLSearchParams/arcgis_javascript_with_uk_data_url_parameters.htm?x=149048&y=930581&l=14

Happy coding!

