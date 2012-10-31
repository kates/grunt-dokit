# <%= title %> #

### TOC ###
<% for (var i = 0; i < toc.length; i++) { %>
**<%= toc[i]['target'] %>**
<% for (var j = 0; j < toc[i]['funcs'].length; j++) { %>
* [<%= toc[i]['funcs'][j] %>](<%= toc[i]['path'] %>)
<% } %>
<% } %>