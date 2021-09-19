// adding custom styles
var styles = `
    .predatory, .predatory a {
        text-decoration-line: line-through; 
        color: #0000004f;
    }
`

var styleSheet = document.createElement("style")
styleSheet.type = "text/css"
styleSheet.innerText = styles
document.head.appendChild(styleSheet)

// defining custom variables
var STOPWORDS =
    [
      'I',          'ME',      'MY',      'MYSELF',
      'WE',         'OUR',     'OURS',    'OURSELVES',
      'YOU',        'YOUR',    'YOURS',   'YOURSELF',
      'YOURSELVES', 'HE',      'HIM',     'HIS',
      'HIMSELF',    'SHE',     'HER',     'HERS',
      'HERSELF',    'IT',      'ITS',     'ITSELF',
      'THEY',       'THEM',    'THEIR',   'THEIRS',
      'THEMSELVES', 'WHAT',    'WHICH',   'WHO',
      'WHOM',       'THIS',    'THAT',    'THESE',
      'THOSE',      'AM',      'IS',      'ARE',
      'WAS',        'WERE',    'BE',      'BEEN',
      'BEING',      'HAVE',    'HAS',     'HAD',
      'HAVING',     'DO',      'DOES',    'DID',
      'DOING',      'A',       'AN',      'THE',
      'AND',        'BUT',     'IF',      'OR',
      'BECAUSE',    'AS',      'UNTIL',   'WHILE',
      'OF',         'AT',      'BY',      'FOR',
      'WITH',       'ABOUT',   'AGAINST', 'BETWEEN',
      'INTO',       'THROUGH', 'DURING',  'BEFORE',
      'AFTER',      'ABOVE',   'BELOW',   'TO',
      'FROM',       'UP',      'DOWN',    'IN',
      'OUT',        'ON',      'OFF',     'OVER',
      'UNDER',      'AGAIN',   'FURTHER', 'THEN',
      'ONCE',       'HERE',    'THERE',   'WHEN',
      'WHERE',      'WHY',     'HOW',     'ALL',
      'ANY',        'BOTH',    'EACH',    'FEW',
      'MORE',       'MOST',    'OTHER',   'SOME',
      'SUCH',       'NO',      'NOR',     'NOT',
      'ONLY',       'OWN',     'SAME',    'SO',
      'THAN',       'TOO',     'VERY',    'S',
      'T',          'CAN',     'WILL',    'JUST',
      'DON',        'SHOULD',  'NOW',     'EI',
      'COMPENDEX',  'SCOPUS',  'JOURNAL', 'INTERNATIONAL',
      'CONFERENCE'
    ]
var GGS_URL = "GII-GRIN-SCIE-Conference-Rating-22-giu-2021.csv"
var PREDATORY_URL = "predatories.txt"
var API = chrome || browser

console.log("WikiCFP - GGS is active")

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

function search_ggs(ggs_data, query) {
  let regex = new RegExp(".*" + query.replace(/ /g, ".*") + ".*");
  var words = query.split(" ").length;
  var matches = new Object();
  var found = false;
  for (row of ggs_data) {
    let target_conf = row[1];
    if (target_conf.match(regex)) {
      // assigning a score to the match
      let match = clean_name(target_conf.toLowerCase()).split(" ").length;
      let match_score = Math.abs(match - words);
      if (matches[match_score] !== undefined) {
        // a similar matching is already present
        matches[match_score] = "err";
      } else {
        matches[match_score] = class_to_score(row[4]);
      }
      found = true;
    }
  }
  if (!found)
    return "n/a";
  // find best matching
  return matches[Math.min(...Object.keys(matches))];
}

function check_predatory(predatories, rows, i) {

  const req = new XMLHttpRequest();
  // To parse the remote document directly as a DOM document
  // req.responseType = "document";

  var out = "";
  var dom_parser = new DOMParser();
  req.onreadystatechange = function(event) {
    if (this.readyState === XMLHttpRequest.DONE) {
      let predatory = false;
      if (this.status === 200) {
        // check website
        var html = dom_parser.parseFromString(this.responseText, 'text/html');
        website = new URL(html.getElementsByTagName("center")[0]
                              .getElementsByTagName("tr")[5]
                              .getElementsByTagName("a")[0]
                              .href)
        predatory = predatories.includes(website.host.replace("^www\.", ""));
      } else {
        //  mark predatory
        predatory = true;
      }
      if (predatory) {
        rows[i].classList.add("predatory");
        rows[i+1].classList.add("predatory");
        rows[i+1].style.cssText = "text-decoration-line: line-through; color: #0000004f;'";
      }
    }
  };

  var url = rows[i].children[0].getElementsByTagName("a")[0].href;
  req.open('GET', url, true);
  req.send(null);
}

function main() {
  var tables = document.getElementsByTagName("table");
  // find the correct table (it is just a table, with no identifier)
  if (tables.length === 9) {
    // my-list page
    var table_idx = 5;
  } else if (tables.length === 12) {
    // output of a category
    var table_idx = 8;
  } else if (tables.length === 6) {
    // output of a search
    var table_idx = 3;
  } else if (tables.length === 15) {
    // homepage
    var table_idx = 12;
  } else {
    // otherwise do nothing
    return;
  }
  var rows = tables[table_idx].getElementsByTagName("tr");

  // load ggs data (conference name in the first column, scoring in the 4th
  // column
  var ggs_data = parse_csv(load_data(GGS_URL));
  var predatories = load_data(PREDATORY_URL).split("\n");

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
      let conference_name = clean_name(row.children[1].innerHTML);
      let ggs_score = search_ggs(ggs_data, conference_name)
      row.innerHTML += '<td>' + ggs_score + '</td>';
      let sjr = '<a href="https://www.scimagojr.com/journalsearch.php?q=' +
                conference_name.replace(/ /, '+') + '" target="_blank">SJR</a>';
      let scholar =
          '<a href="https://scholar.google.it/citations?hl=it&view_op=search_venues&vq=' +
          conference_name.replace(/ /, '+') + '" target="_blank">Scholar</a>';
      row.innerHTML += '<td>' + sjr + ', ' + scholar + '</td>';
    }
  }
}

main();
