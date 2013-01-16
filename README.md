Table 2 Net
=========
**Extract a network from a table.** *Set a column for nodes and a column for edges. It deals with multiple items per cell.*

*[Table2Net](http://tools.medialab.sciences-po.fr/table2net/)* allows you to get a network from a table. You will get a GEXF file that you can visualize and analyze with [Gephi](http://gephi.org). You may extract different types of networks from a table. It depends on how you use columns to build the nodes and the edges:
* **Normal**: if you want a single type of nodes, for instance authors. They will be linked when they share a value in another column, for instance papers.
* **Bipartite**: if you want two types of nodes, for instance authors and papers, they will be linked whey they appear in the same row of the table.
* **Citation**: if you have a column containing references to another one, for instance paper title and cited papers (title)
* **No link**: a single type of nodes, without link

You can add columns as metadata of the nodes and/or edges, you can set a separator if you have multipe items per cell, and you can set a column as time if you want a dynamic network.

###More info
* The tool itself is [available online](http://tools.medialab.sciences-po.fr/table2net/)
* Its source code is available on [GitHub](https://github.com/medialab/table2net/)
* If you have issues or requests, [tell us about them](https://github.com/medialab/table2net/issues)
* [Gephi](http://gephi.org) is highly recommanded in complement
* You will find more tools on [Médialab Tools](http://tools.medialab.sciences-po.fr/)