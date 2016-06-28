var MESSAGES_URL = 'http://message-list.appspot.com/messages';
var SCROLL_OFFSET = 1000;

var response = {}; // Latest response from api
var messages = []; // All currently loaded message nodes

function load_messages (limit=10, onload) {
	var url = MESSAGES_URL
	if (response.pageToken) url += '?' + response.pageToken;
	if (limit != 10) url += '?limit=' + limit;
	var request = new XMLHttpRequest();
	request.onload = handle_response;
	request.open('GET', url, true);
	request.send();

	function handle_response () {
		if (this.status == 200) {
			response = JSON.parse(this.response);
			if (onload) onload();
		}
	}
}

function update_view () {
	for (var i = 0; i < response.messages.length; i++) {
		add_message_to_dom(response.messages[i]);
	}
}

function add_message_to_dom (message) {
	var author = div('message-author');
	author.textContent = message.author.name;

	var content = div('message-content');
	content.textContent = message.content;

	var date = div('message-date');
	var date_string = new Date(message.updated);
	date_string = date_string.toLocaleDateString();
	date.textContent = date_string;

	var node = div('message');
	node.appendChild(author);
	node.appendChild(content);
	node.appendChild(date);

	document.body.appendChild(node);
	messages.push(node);

	function div (classList) {
		var node = document.createElement('div');
		if (classList) {
			node.classList.add(classList);
		}
		return node;
	}
}

function scrolled () {
	if (near_bottom()) {
		load_messages(30, update_view);
		stopObserve();
	}
}

function near_bottom () {
	var bottom = document.body.scrollTop + document.body.clientHeight;
	var below = document.body.scrollHeight - bottom;
	return ( below <= SCROLL_OFFSET );

}

function startObserve () {
	document.addEventListener('scroll', function () {
		scrolled();
	});
}

function stopObserve () {
	document.removeEventListener('scroll');

	document.setTimeout(startObserve, 2000);
}

// on page load, request 30 messages
load_messages(30, update_view);
startObserve();
