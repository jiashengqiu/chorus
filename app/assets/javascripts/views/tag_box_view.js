chorus.views.TagBox = chorus.views.Base.extend({
    templateName: "tag_box",
    constructorName: "TagBoxView",
    events: {
        "click .save_tags": "saveTags",
        "click .edit_tags": "editTags"
    },

    postRender: function() {
        var textarea = this.$('textarea.tag_editor');
        var tagNames = this.model.get("tagNames");
        this.textext = textarea.textext({
            plugins: 'tags prompt focus autocomplete',
            tagsItems: tagNames,
            prompt: ""
        });

        textarea.bind('isTagAllowed', _.bind(this.textExtValidate, this));
        textarea.bind('setInputData', _.bind(this.restoreInvalidTag, this));

        this.textext_elem = this.$('.text-core');
        if(!this.model.hasTags()) this.textext_elem.addClass("hidden");
        this.$(".text-button").addClass("disabled");
    },

    textExtValidate: function(e, data) {
        this.invalidTag = "";
        if (!this.validateTag(data.tag)) {
            data.result = false;
            this.invalidTag = data.tag;
        }
    },

    validateTag: function(tagName) {
        this.clearErrors();

        var valid = true;
        if(tagName.length > 100) {
            valid = false;
            this.markInputAsInvalid(this.$('textarea'), t("field_error.TOO_LONG", {field: "Tag", count : 100}), false);
        }

        var tagNames = JSON.parse(this.$('input[type=hidden]').val());
        if(_.indexOf(tagNames, tagName) >= 0 ) {
            valid = false;
        }

        return valid;
    },

    restoreInvalidTag: function(e) {
        if (this.invalidTag) {
            this.$('textarea').val(this.invalidTag);
            this.invalidTag = "";
        }
    },

    additionalContext: function() {
        return {
            hasTags: this.model.hasTags()
        };
    },


    saveTags: function(e) {
        e.preventDefault();
        var tagNames = JSON.parse(this.$('input[type=hidden]').val());
        var textareaText = this.$("textarea").val().trim();

        if(textareaText) {
            tagNames.push(textareaText);
            var tagsInvalid = !this.validateTag(textareaText)
        }

        if(!tagsInvalid) {
            this.model.set('tagNames', tagNames, {silent: true});

            $.post('/taggings', {
                entity_id: this.model.id,
                entity_type: this.model.entityType,
                tag_names: tagNames
            });

            this.render();
        }
    },

    editTags: function(e){
        e.preventDefault();
        if(!this.model.hasTags()) {
            this.textext_elem.toggleClass("hidden");
        }
        this.$(".save_tags").toggleClass("hidden");
        this.$(".edit_tags").toggleClass("hidden");
        this.$("textarea").removeAttr("disabled");
        this.$("textarea").removeClass("borderless");
        this.$(".text-button").removeClass("disabled");
    }
});
