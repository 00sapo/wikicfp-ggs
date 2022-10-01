# WikiCFP - GGS

#### Safely search Computer Science/Engineering conferences by deadline

## 1. Features

* mark predatory conferences and journals
* add GGS score
* add links to ScimagoJR and Google Scholar

---

This is a browser extension that adds GGS rankings to WikiCFP pages.  It should
work for all major browsers, but only Firefox and Chromium are tested and
maintained. However, only the Firefox web store will distribute the addon for
now. If anyone having a google web store account would like to distribute this
extension, it's welcome. You can still load this extension via developer option
in chrome.

The extension adds one column with the conference rankings, one column with 
links to Goggle Scholar and ScimagoJR queries for each call and a drop-line over
predatory call for papers.

Ranking used is GGS. It is assigned to computer science conferences by a
spanish-italian academic consortium and is based on rankings from 3 different
sources. Rankings are between 7 (best) and 0 (worst). Note that 0 is also used for
conferences that are not top and have too few data for a fair rating. More
details are available on the [GGS website](https://scie.lcc.uma.es:8443/).

 This tool also helps avoiding predatory conferences by using the list of
 publisher and journal websites available at https://beallslist.net .

 MDPI is not considered predatory anymore, but you should be careful and trust
 the organizers.

## 2. Usage

Two columns are added to the list of calls. 

The first shows the GGS score. By clicking on it, the GGS website shows up, as
well as the detected acronym and search string.

In the second column, two links to SJR and Scholar queries are added.

Each call detected as predatory is dropped with a line.

The above data are also available on the pages of each call.

### 2.1. `n/a`
If the `GSS` column is `n/a`, it means that:
1. the cfp is for a journal
2. the conference is very bad (not available in GGS)
3. the conference was not matched by my algorithm (this usually does not
 happen)
4. the conference is new

### 2.2. `err`
If the `GSS` column is `err`, it means that:
1. the GGS score was malformed (no known cases)
2. the algorithm has found more than one match for this conference (rare case)

In any of the above cases, I strongly suggest you to 
1. check Scholar, SJR and GGS rankings via the provided links (you can click
  the `GGS` score to go the GGS website)
2. if you do not find the conference/journal on these databases, only publish
  if you really trust the organizers.

### 2.3. Drop lines

Predatory conferences are marked with a drop-line.

### 2.4. Integer values

Rankings are between 7 (best) and 0 (worst). Note that 0 is also used for
conferences that are not top and have too few data for a fair rating. More
details are available on the [GGS website](https://scie.lcc.uma.es:8443/).

Predatory conferences often mimic the name of famous conferences. For this
reason, they may are associated to a GGS score, but if they are marked as
predatory, you should avoid them.

## Credits

Federico Simonetta - https://federicosimonetta.eu.org

## License

GPL3
