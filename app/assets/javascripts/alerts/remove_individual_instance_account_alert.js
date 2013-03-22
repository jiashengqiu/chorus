chorus.alerts.RemoveIndividualAccount = chorus.alerts.Confirm.extend({
    constructorName: "RemoveIndividualAccount",

    ok:t("instances.remove_individual_account.remove"),

    setup: function() {
        this.title = t("instances.remove_individual_account.title", {dataSourceName: this.options.dataSourceName, userName: this.options.name});
    },

    confirmAlert:function () {
        this.trigger("removeIndividualAccount");
        this.closeModal();
    }
});

