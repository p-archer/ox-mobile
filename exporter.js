/* global require, process */

const { getStateClass, setStates } = require('./states');
const fs = require('fs');

const Templates = {
	body: 'templates/main.html',
};

main(process.argv);

function main(args) {
	let { input, output, options } = parseArguments(args);
	if (!input) {
		throw 'no input file specified';
	}

	let template = fs.readFileSync(Templates.body, 'utf-8');
	let inputData = fs.readFileSync(input, 'utf-8');
	let html = [];

	let level = 0;
	inputData.split('\n').forEach((line) => {
		line = line.trim();
		if (!line || !line.length || line.startsWith(':')) {
			return;
		}

		if (line.startsWith('#+')) {
			let config = line.replace(/^\#\+/, '');
			let words = config.split(' ');
			switch (words[0]) {
			case 'TITLE:':
				html.push('<h1 class="main-title">' + words.slice(1).join(' ') + '</h1>');
				return;
			case 'TODO:' :
				setStates(words.slice(1).join(' '));
				return;
			default:
				return;
			}
		}

		// let marker = ['*', '-', '+', '='];
		let marker = ['', '', '', '+', '-'];
		let newLevel = isHeader(line);
		if (newLevel > 0) {
			if (newLevel < level) {
				for (let i = level; i >= newLevel; i--) {
					html.push('</div>');
				}
				html.push('<div class="heading heading-' + newLevel + '">');
				html.push(pushHeading(newLevel, line, marker));
			}
			if (newLevel === level) {
				html.push('</div>');
				html.push('<div class="heading heading-' + newLevel + '">');
				html.push(pushHeading(newLevel, line, marker));
			}
			if (newLevel > level) {
				for (let i = level; i < newLevel; i++) {
					html.push('<div class="heading heading-' + newLevel + '">');
				}
				html.push(pushHeading(newLevel, line, marker));
			}

			level = newLevel;
		} else {
			html.push('<p class="' + level + '">' + line + '</p>');
		}

	});
	html.push('</div>');

	let outputData = addContent(template, html.join('\n'));

	if (!output) {
		output = input.split('.').slice(0, -1).join('.') + '.html';
	}
	fs.writeFileSync(output, outputData, 'utf-8');

	console.log('options = ', options);
}

function pushHeading(level, content, marker = 'num') { //TODO: tags, checkboxes, counters
	content = content.replace(/^\**/, '').trim();
	let result = '<div class="title">';

	let tagList = content.match(/:.+:$/);
	if (tagList) {
		content = content.replace(/:.+:$/, '');
	}

	if (typeof marker === 'string') {
		if (marker === 'num') {
			result += level + ' -';
		} else {
			result += marker;
		}
	}
	if (marker.push) {
		result += marker[level-1];
	}

	let type = content.split(' ')[0];
	let typeClass = getStateClass(type);
	if (typeClass !== 'unknown') {
		content = content.split(' ').slice(1).join(' ');
		result += '<div class="type ' + typeClass + '">' + type + '</div><div class="content">' + content.replace(/^\**/, '').trim() + '</div>';
	} else {
		result += '<div class="content">' + content.replace(/^\**/, '').trim() + '</div>';
	}

	if (tagList) {
		let tags = tagList[0].split(':').slice(1, -1);
		tags.forEach((t) => {
			result += '<div class="tag">' + t + '</div>';
		});
	}

	return result + '</div>';
}

function parseArguments(args) {
	let input, output, options;

	for (let i=2; i<args.length; i++) {
		let arg = args[i];
		switch (arg) {
		case '-i':
		case '--input':
			input = args[++i];
			break;
		case '-o':
		case '--output':
			output = args[++i];
			break;
		default:
			if (!options) {
				options = [];
			}

			options.push(arg);
		}
	}

	return {
		input: input,
		output: output,
		options: options
	};
}

function addContent(template, content) {
	return template.replace(/%CONTENT%/, content);
}

function isHeader(line) {
	let head = line.match(/^\**/);
	return head[0].length;
}

String.prototype.startsWith = function(str) {
	return this.slice(0, str.length) === str;
};
