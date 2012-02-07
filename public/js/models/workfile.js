(function () {
    var imageRegex = /^image\//;
    var textRegex = /^text\//;

    chorus.models.Workfile = chorus.models.Base.extend({
        entityType:"workfile",

        urlTemplate:function () {
            if (this.isLatestVersion()) {
                return "workspace/{{workspaceId}}/workfile/{{id}}"
            } else {
                return "workspace/{{workspaceId}}/workfile/{{id}}/version/{{versionInfo.versionNum}}"
            }
        },

        showUrlTemplate:function () {
            if (this.isLatestVersion()) {
                return "workspaces/{{workspaceId}}/workfiles/{{id}}"
            } else {
                return "workspaces/{{workspaceId}}/workfiles/{{id}}/versions/{{versionInfo.versionNum}}"
            }
        },

        showUrlForVersion:function (version) {
            return "#/workspaces/" + this.get("workspaceId") + "/workfiles/" + this.get("id") + "/versions/" + version;
        },

        initialize:function () {
            if (this.collection && this.collection.attributes.workspaceId) {
                this.set({workspaceId:this.collection.attributes.workspaceId}, {silent:true});
            }
        },

        workspace:function () {
            this._workspace = (this._workspace || new chorus.models.Workspace({ id:this.get("workspaceId")}))
            return this._workspace;
        },

        sandbox:function () {
            return this.workspace().sandbox()
        },

        executionSchema:function () {
            var executionInfo = this.get("executionInfo");
            if (executionInfo && executionInfo.schemaName) {
                return new chorus.models.Schema({
                    instanceId:executionInfo.instanceId,
                    instanceName:executionInfo.instanceName,
                    databaseId:executionInfo.databaseId,
                    databaseName:executionInfo.databaseName,
                    id:executionInfo.schemaId,
                    name:executionInfo.schemaName
                });
            } else {
                return this.sandbox() && this.sandbox().schema();
            }
        },

        modifier:function () {
            return new chorus.models.User({
                userName:this.get("modifiedBy"),
                firstName:this.get("modifiedByFirstName"),
                lastName:this.get("modifiedByLastName"),
                id:this.get("modifiedById")
            })
        },

        content:function (newContent, options) {
            if (arguments.length) {
                this.get("versionInfo").content = newContent;
                this.set({content:newContent}, options);
            } else {
                return this.get("versionInfo").content;
            }
        },

        lastComment:function () {
            var comments = this.get("recentComments");
            return comments && comments.length > 0 && new chorus.models.Comment({
                body:comments[0].text,
                author:comments[0].author,
                commentCreatedStamp:comments[0].timestamp
            });
        },

        createDraft:function () {
            var draft = new chorus.models.Draft({workfileId:this.get("id"), workspaceId:this.get("workspaceId"), content:this.content()});
            draft.bind("saved", function () {
                this.isDraft = true;
                this.set({ hasDraft:true }, { silent:true });
            }, this);
            return draft;
        },

        allVersions:function () {
            return new chorus.collections.WorkfileVersionSet([], {
                workspaceId:this.get("workspaceId"),
                workfileId:this.get("id")
            });
        },

        declareValidations:function (newAttrs) {
            this.require("fileName", newAttrs);
        },

        attrToLabel:{
            "fileName":"workfiles.validation.name"
        },

        isImage:function () {
            var type = this.get("mimeType");
            return type && type.match(imageRegex);
        },

        isSql:function () {
            var type = this.get("fileType");
            return type == "SQL";
        },

        isText:function () {
            var type = this.get("mimeType");
            return type && type.match(textRegex);
        },

        downloadUrl:function () {
            var url = URI(this.url())
            url.path(url.path() + "/file/" + this.get("versionInfo").versionFileId)
            url.addSearch({ download: "true" })
            return url.toString();
        },

        workfilesUrl:function () {
            return "#/workspaces/" + this.get("workspaceId") + "/workfiles";
        },

        canEdit:function () {
            return this.isLatestVersion();
        },

        isLatestVersion:function () {
            var versionNum = this.get('versionInfo') && this.get('versionInfo').versionNum;
            return (!versionNum || versionNum === this.get("latestVersionNum"))
        },


        save:function (attrs, options) {
            if (this.canEdit()) {
                options = options || {};
                attrs = attrs || {};
                var overrides = {};

                if (this.get("versionInfo") && this.get("versionInfo").versionNum) {
                    overrides.url = "/edc/workspace/" + this.get("workspaceId") + "/workfile/" + this.get("id") + "/version/" + this.get("versionInfo").versionNum;
                    attrs['lastUpdatedStamp'] = this.get("versionInfo").lastUpdatedStamp;
                }

                return this._super("save", [attrs, _.extend(options, overrides)]);
            }
        },

        saveAsNewVersion:function (attrs, options) {
            options = options || {};

            var overrides = {
                method:'create',
                url:"/edc/workspace/" + this.get("workspaceId") + "/workfile/" + this.get("id") + "/version"
            };

            return this._super("save", [attrs, _.extend(options, overrides)])
        }
    });
})();
