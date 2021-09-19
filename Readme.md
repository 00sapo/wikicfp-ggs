# WikiCFP - GGS

This is a borwser extension that helps using WikiCFP without incurring in 
low-level publications. It should work for all major browsers, but only 
Firefox and Chromium are tested and maintained. You can still load this 
extension via developer option in chrome.

The extension adds one column with the conference rankings, one column with 
links to Goggle Scholar and ScimagoJR queries for each cfp and a line mark over
predatory cfp.

Ranking used is GGS. It is assigned to computer science conferences by a
spanish-italian academic consortium and is based on rankings from 3 different
sources. This tool also help avoiding predatory conferences by using the list
of publishers and journals available at https://beallslist.net .

Rankings are between 7 (best) and 0 (worst). Note that 0 is also used for
conferences that are not top and have too few data for a fair rating. More
details are available on the [GGS website](https://scie.lcc.uma.es:8443/).

### `n/a`
If the `GSS` column is `n/a`, it means that:
1. the cfp is for a journal
2. the conference is very bad
3. the conference was not matched because of wrong name in WikiCFP
4. the conference is new

### `err`
If the `GSS` column is `err`, it means that:
1. the GGS score was malformed (no known cases)
2. the algorithm has found more than one match for this conference

In any of the above cases, I strongly suggest you to 
1. check scholar, sjr and GGS rankings via the provided links (you can click
   the `GGS` table header to go the GGS website)
2. if you do not find the conference/journal on these databases, only publish
   if you really trust the organizers.
3. avoid conferences marked as predatory.

## Credits

Federico Simonetta - https://federicosimonetta.eu.org

## License

GPL3
