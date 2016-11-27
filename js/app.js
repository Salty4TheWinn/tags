(function ($, Promise) {
    
    var availableTags = {};
    var availableChampions = {};
    
    var dataReceived = $.get('json/data.json').then(function (data) {
        data.forEach(function (champion) {
           champion.tags.forEach(function (tag) {
               availableTags[tag] = tag;
           });
           availableChampions[champion.code] = champion;
        });
    });
          
    var documentReady = new Promise(function (resolve, reject) {
        $(resolve);
    });

    Promise.all([documentReady, dataReceived]).then(function () {
        var defaultLanguage = navigator.languages
            ? navigator.languages[0]
            : (navigator.language || navigator.userLanguage);
            
        $('#lang').val(defaultLanguage.substr(0,2)).on('change', changeLocale);
        changeLocale();
    });
    
    function changeLocale(newLocale) {
        var lang = $('#lang').val() || 'en';
        $.get('json/translation.'+lang+'.json').then(function (data) {
            Object.keys(availableTags).forEach(function (code) {
                availableTags[code] = data.tag[code];
            });
            Object.keys(availableChampions).forEach(function (code) {
                availableChampions[code].name = data.champion[code];
            });
            setupCombo();
        });
    }
    
    function setupCombo() {
        $('#tags').empty();
        Object.keys(availableTags).forEach(function (code) {
            $('#tags').append('<option value="'+code+'">'+availableTags[code]+'</option>');
        });
        $('#tags').multiselect({
            nonSelectedText: "Select some tags",
            onChange: refreshList
        });
        refreshList();
    }
    
    function refreshList() {
        var selectedOptions = $('#tags option:selected');
                var selectedTags = [];
                selectedOptions.each(function (index, elt) {
                    selectedTags.push($(elt).val());
                });
                var filteredChampions = Object.keys(availableChampions).filter(function (code) {
                    return selectedTags.every(function (selectedTag) {
                        return availableChampions[code].tags.includes(selectedTag);
                    });
                });
                displayList(filteredChampions, selectedTags);
    }
    
    function displayList(list, selectedTags) {
        $('#list').empty();
        list.forEach(function (code) {
            displayChampion(code, selectedTags);
        });
    }
    
    function displayChampion(code, selectedTags) {
        var champion = availableChampions[code];
        var $div = $('<div class="champion">');
        $div.addClass(champion.class);

        $img = $('<img class="portrait">').attr('src', 'http://hook.github.io/champions/images/champions/portrait_'+champion.code+'.png');
        $div.prepend($img);
        
        $text = $('<div class="text">').appendTo($div);
        $name = $('<div class="name">').text(champion.name).appendTo($text);
        
        $tags = $('<div class="tags">').appendTo($text);
        champion.tags.forEach(function (tag) {
            $span = $('<span class="tag">').text('#'+availableTags[tag]).appendTo($tags);
            if(selectedTags.includes(tag)) {
                $span.addClass('matched');
            }
        });
        $('#list').append($div);
    }
    
})(jQuery, Promise);