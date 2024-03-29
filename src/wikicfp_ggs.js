// adding custom styles
var styles = `
    .predatory, .predatory a {
        text-decoration-line: line-through; 
        color: #0000004f;
    }

    .unknownpredatory, .unknownpredatory a {
        color: #0000004f;
    }

    .warning {
        color: red;
        font-size: xxx-large;
    }

    .marker {
        font-size: x-large;
    }
    #ggs-iframe {
      position: absolute;
      margin: auto;
      width: 75%;
      height: 75%;
      z-index: 99;
      background: white;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      visibility: hidden;
      font-size: large;
      text-align: center;
    }
    #ggs-iframe iframe {
      height: 75%;
      width: 100%;
    }

    #ggs-acronym {
      text-name: brown;
    }

    #ggs-name {
      text-name: brown;
    }

    #ggs-description {
      height: 25%;
      
    }
`

var styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

// defining custom variables
var STOPWORDS = [
  'I', 'ME', 'MY', 'MYSELF',
  'WE', 'OUR', 'OURS', 'OURSELVES',
  'YOU', 'YOUR', 'YOURS', 'YOURSELF',
  'YOURSELVES', 'HE', 'HIM', 'HIS',
  'HIMSELF', 'SHE', 'HER', 'HERS',
  'HERSELF', 'IT', 'ITS', 'ITSELF',
  'THEY', 'THEM', 'THEIR', 'THEIRS',
  'THEMSELVES', 'WHAT', 'WHICH', 'WHO',
  'WHOM', 'THIS', 'THAT', 'THESE',
  'THOSE', 'AM', 'IS', 'ARE',
  'WAS', 'WERE', 'BE', 'BEEN',
  'BEING', 'HAVE', 'HAS', 'HAD',
  'HAVING', 'DO', 'DOES', 'DID',
  'DOING', 'A', 'AN', 'THE',
  'AND', 'BUT', 'IF', 'OR',
  'BECAUSE', 'AS', 'UNTIL', 'WHILE',
  'OF', 'AT', 'BY', 'FOR',
  'WITH', 'ABOUT', 'AGAINST', 'BETWEEN',
  'INTO', 'THROUGH', 'DURING', 'BEFORE',
  'AFTER', 'ABOVE', 'BELOW', 'TO',
  'FROM', 'UP', 'DOWN', 'IN',
  'OUT', 'ON', 'OFF', 'OVER',
  'UNDER', 'AGAIN', 'FURTHER', 'THEN',
  'ONCE', 'HERE', 'THERE', 'WHEN',
  'WHERE', 'WHY', 'HOW', 'ALL',
  'ANY', 'BOTH', 'EACH', 'FEW',
  'MORE', 'MOST', 'OTHER', 'SOME',
  'SUCH', 'NO', 'NOR', 'NOT',
  'ONLY', 'OWN', 'SAME', 'SO',
  'THAN', 'TOO', 'VERY', 'S',
  'T', 'CAN', 'WILL', 'JUST',
  'DON', 'SHOULD', 'NOW', 'EI',
  'COMPENDEX', 'SCOPUS', 'JOURNAL', 'INTERNATIONAL',
  'CONFERENCE', 'AMP'
];

var GGS_URL = "GII-GRIN-SCIE-Conference-Rating-24-ott-2021-9.17.09-Output.csv";
var PREDATORY_URL = "predatories.txt";
var API = chrome || browser;

console.log("WikiCFP - GGS is active");

function remove_stopwords(str) {
  res = [];
  words = str.split(' ');
  for (i = 0; i < words.length; i++) {
    word_clean = words[i].split(".").join("");
    if (!STOPWORDS.includes(word_clean)) {
      res.push(word_clean);
    }
  }
  return (res.join(' '));
}

function clean_name(str) {
  // remove words starting with numbers
  str = str.replace(/\d+[^ ]*/g, '');
  // remove acronym (all-uppercase words)
  str = str.replace(/[A-Z][A-Z][A-Z]+/g, '');
  // convert to upper case
  str = str.toUpperCase();
  // remove non-alphanumeric characters
  str = str.replace(/[^A-Z ]/g, '');
  // remove stop-words
  str = remove_stopwords(str);
  return str.trim();
}

function load_data(url) {
  var localUrl = API.extension.getURL(url);

  const req = new XMLHttpRequest();
  // To parse the remote document directly as a DOM document
  // req.responseType = "document";

  var out = "";
  req.onreadystatechange = function(event) {
    if (this.readyState === XMLHttpRequest.DONE) {
      if (this.status === 200) {
        out = this.responseText;
      } else {
        out = this.statusText;
      }
    }
  };

  req.open('GET', localUrl, false);
  req.send(null);

  return out;
}

function parse_csv(str) {
  var arr = [];
  var quote = false; // 'true' means we're inside a quoted field

  // Iterate over each character, keep track of current row and column (of the
  // returned array)
  for (var row = 0, col = 0, c = 0; c < str.length; c++) {
    var cc = str[c], nc = str[c + 1]; // Current character, next character
    arr[row] = arr[row] || [];        // Create a new row if necessary
    arr[row][col] =
      arr[row][col] ||
      ''; // Create a new column (start with empty string) if necessary

    // If the current character is a quotation mark, and we're inside a
    // quoted field, and the next character is also a quotation mark,
    // add a quotation mark to the current column and skip the next character
    if (cc == '"' && quote && nc == '"') {
      arr[row][col] += cc;
      ++c;
      continue;
    }

    // If it's just one quotation mark, begin/end quoted field
    if (cc == '"') {
      quote = !quote;
      continue;
    }

    // If it's a comma and we're not in a quoted field, move on to the next
    // column
    if (cc == ',' && !quote) {
      ++col;
      continue;
    }

    // If it's a newline (CRLF) and we're not in a quoted field, skip the next
    // character and move on to the next row and move to column 0 of that new
    // row
    if (cc == '\r' && nc == '\n' && !quote) {
      ++row;
      col = 0;
      ++c;
      continue;
    }

    // If it's a newline (LF or CR) and we're not in a quoted field,
    // move on to the next row and move to column 0 of that new row
    if (cc == '\n' && !quote) {
      ++row;
      col = 0;
      continue;
    }
    if (cc == '\r' && !quote) {
      ++row;
      col = 0;
      continue;
    }

    // Otherwise, append the current character to the current column
    arr[row][col] += cc;
  }
  return arr;
}

function class_to_score(cl) {
  if (cl === "A++")
    return "7";
  else if (cl === "A+")
    return "6";
  else if (cl === "A")
    return "5";
  else if (cl === "A-")
    return "4";
  else if (cl === "B")
    return "3";
  else if (cl === "B-")
    return "2";
  else if (cl === "C")
    return "1";
  else if (cl === "Work in Progress")
    return "0";
  else
    return "err";
}

function search_ggs(ggs_data, name, acronym) {
  let regex = new RegExp(".*" + name.replace(/ /g, ".*") + ".*");
  var words = name.split(" ").length;
  var name_matches = new Object();
  var acrn_score = "n/a";
  var name_found = false;
  var acrn_found = false;
  for (var row of ggs_data) {
    let target_conf_name = row[1];
    let target_conf_acrn = row[2];
    if (target_conf_name.match(regex)) {
      // assigning a score to the match
      let match = clean_name(target_conf_name.toLowerCase()).split(" ").length;
      let match_score = Math.abs(match - words);
      if (name_matches[match_score] !== undefined) {
        // a similar matching is already present
        name_matches[match_score] = "err";
      } else {
        name_matches[match_score] = class_to_score(row[4]);
      }
      name_found = true;
    }
    if (target_conf_acrn.toUpperCase() === acronym) {
      acrn_score = class_to_score(row[4]);
      acrn_found = true;
    }
  }

  // find best matching
  const name_score = name_matches[Math.min(...Object.keys(name_matches))];
  name_found = name_score === "err" ? false : name_found;
  // the following has this idea: if both acronym and name were found but with
  // two different scores, then it's likely that the acronym was wrong
  // (because of `-` chars and multiple conferences with the same acronym e.g.
  // ICMC)
  if (!name_found && !acrn_found) {
    return "n/a";
  } else if (name_found && !acrn_found) {
    return name_score;
  } else if (!name_found && acrn_found) {
    return acrn_score;
  } else if (name_found && acrn_found) {
    if (acrn_score === name_score)
      return acrn_score;
    else
      return name_score;
  }
}

function check_predatory_website(dom, predatories) {
  let predatory = false;
  let unknown = false;
  let url = ""
  try {
    url = dom.getElementsByTagName("tr")[8].getElementsByTagName("a")[0].href
  } catch (e) {
    console.log("Website not detected!")
    unknown = true
  }
  if (url != "") {
    try {
      let website = new URL(url);
      predatory = predatories.includes(website.host.replace("^www\.", ""));
    } catch (e) {
      console.log(e);
      unknown = true;
    }
  }
  return [predatory, unknown];
}

function check_predatory(predatories, rows, i) {

  const req = new XMLHttpRequest();
  // To parse the remote document directly as a DOM document
  // req.responseType = "document";

  var dom_parser = new DOMParser();
  req.onreadystatechange = function(event) {
    if (this.readyState === XMLHttpRequest.DONE) {
      let predatory = false;
      let unknown = false;
      if (this.status === 200) {
        // check website
        var html = dom_parser.parseFromString(this.responseText, 'text/html');
        [predatory, unknown] = check_predatory_website(html, predatories);
      } else {
        //  mark predatory
        unknown = true;
      }
      if (predatory) {
        rows[i].classList.add("predatory");
        rows[i + 1].classList.add("predatory");
      } else if (unknown) {
        rows[i].classList.add("unknownpredatory");
        rows[i + 1].classList.add("unknownpredatory");
      }
    }
  };

  var url = rows[i].children[0].getElementsByTagName("a")[0].href;
  // true is for asynchronous, false is for synchronous
  req.open('GET', url, false);
  req.send(null);
}

function clean_acronym(str) {
  // split string
  const splits = str.split(/ |--/);
  var acr = "";
  // take the first all-uppercase split different from IEEE and ACM
  for (s of splits) {
    if (s !== "IEEE" && s !== "ACM" && s.match(/[A-Z0-9]+/g)) {
      acr = s;
      break;
    }
  }
  return acr.toUpperCase();
}

function check_ggs(name, acronym, ggs_data) {
  let conference_name = clean_name(name);
  let conference_acrn = clean_acronym(acronym);
  let ggs_score = search_ggs(ggs_data, conference_name, conference_acrn)
  let ggs = '<a href="#" onclick="toggle_ggs_iframe(\'' + conference_name + '\', \'' + conference_acrn + '\');">' + ggs_score + '</a>'
  let sjr = '<a href="https://www.scimagojr.com/journalsearch.php?q=' +
    conference_name.replace(/ /, '+') + '" target="_blank">SJR</a>';
  let scholar =
    '<a href="https://scholar.google.it/citations?hl=it&view_op=search_venues&vq=' +
    conference_name.replace(/ /, '+') + '" target="_blank">Scholar</a>';
  return [ggs, sjr, scholar];
}


function toggle_ggs_iframe(name, acronym) {
  document.getElementById('ggs-name').innerHTML = name
  document.getElementById('ggs-acronym').innerHTML = acronym

  let style = document.getElementById("ggs-iframe").style
  if (style.visibility === "hidden")
    style.visibility = "visible";
  else
    style.visibility = "hidden";
}

function parse_table(rows, ggs_data, predatories) {
  // iterate the rows
  for (let i = 0; i < rows.length; i++) {
    let row = rows[i];
    if (i === 0) {
      // heading of the table
      row.innerHTML +=
        '<td><a href="https://scie.lcc.uma.es:8443/" target="_blank">GGS</a></td>';
      row.innerHTML += '<td>Others</td>';
    } else if (i % 2 === 1) {
      // only for odd rows
      // the following works asynchronously...
      check_predatory(predatories, rows, i);

      // in the meantime, go on as if it was not predatory
      [ggs_score, sjr, scholar] =
        check_ggs(row.children[1].innerText, row.children[0].innerText, ggs_data);
      row.innerHTML += '<td>' + ggs_score + '</td>';
      row.innerHTML += '<td>' + sjr + ', ' + scholar + '</td>';
    }
  }
}

function parse_event(ggs_data, predatories) {
  // check predatory
  var table =
    document.getElementsByTagName("table")[7].getElementsByTagName("tr")[0];
  let [predatory, unknown] = check_predatory_website(document, predatories);
  if (predatory) {
    // add marker
    table.innerHTML += "<td class='warning'>THIS IS LIKELY A PREDATORY CONFERENCE!</td>";
    return;
  }

  // search ggs scores
  let description =
    document.querySelector('meta[name="description"]').content.split(" : ");
  [ggs_score, sjr, scholar] = check_ggs(description[1], description[0], ggs_data);

  // add marker
  table.innerHTML +=
    "<td class='marker'>GGS: " + ggs_score + ", " + sjr + ", " + scholar + "</td>";

  if (unknown) {
    // add marker
    table.innerHTML += "<td class='warning'>WE COULDN'T CHECK IF THIS IS A PREDATORY CONFERENCE!</td>";
    return;
  }
}

function main() {
  // load ggs data (conference name in the first column, scoring in the 4th
  // column
  var ggs_data = parse_csv(load_data(GGS_URL));
  var predatories = load_data(PREDATORY_URL).split("\n");

  // find the correct table (it is just a table, with no identifier)
  var tables = document.getElementsByTagName("table");
  var path = window.location.pathname;
  if (path === "/cfp/servlet/event.showlist") {
    // `my-list` page
    var table_idx = 8;
  } else if (path === "/cfp/call") {
    // output of a category
    var table_idx = 5;
  } else if (path === "/cfp/servlet/tool.search" || path === "/cfp/allcfp") {
    // output of a search or `all-cfp` page
    var table_idx = 3;
  } else if (path === "/cfp/home" || path === "/cfp/") {
    // homepage
    var table_idx = 12;
  } else if (path === "/cfp/servlet/event.showcfp") {
    // event page
    parse_event(ggs_data, predatories);
    return;
  } else {
    // otherwise do nothing
    return;
  }
  var rows = tables[table_idx].getElementsByTagName("tr");
  parse_table(rows, ggs_data, predatories);

  // Add the GGS iframe
  document.getElementsByTagName("body")[0].innerHTML += `
  <div id="ggs-iframe">
    <div id="ggs-description">
      Detected acronym: <div id="ggs-acronym"></div>
      Detected name search: <div id="ggs-name"></div>
      <a href="#" onclick="toggle_ggs_iframe('', '')"> Hide! </a>
    </div>
    <iframe src="https://scie.lcc.uma.es:8443/ratingSearch.jsf">
    </iframe>
  </div>
  `
  var s = document.createElement('script');
  s.textContent = String(toggle_ggs_iframe);
  (document.head || document.documentElement).appendChild(s);
  s.remove();
}

main();
