describe("chorus.views.DashboardProjectList", function() {
    beforeEach(function() {
        this.workspace1 = backboneFixtures.workspace({ name: "Broccoli", owner: { firstName: 'Green', lastName: 'Giant' }, latestCommentList: [], summary: 'We are making sails!' });

        this.workspace2 = backboneFixtures.workspace({ name: "Camels", owner: { firstName: 'Andre', lastName: 'The Giant' }, latestCommentList: [], numberOfInsights: 1});
        delete this.workspace2.attributes.summary;
        spyOn(this.workspace2, 'latestInsight').andReturn(backboneFixtures.activity.sandboxAdded());

        this.workspace3 = backboneFixtures.workspace({numberOfInsights: 3});
        spyOn(this.workspace3, 'latestInsight').andReturn(backboneFixtures.activity.sandboxAdded());

        this.collection = new chorus.collections.WorkspaceSet([this.workspace1, this.workspace2, this.workspace3]);
        this.collection.loaded = true;
        this.view = new chorus.views.DashboardProjectList({collection: this.collection});
    });

    describe("#render", function() {
        beforeEach(function() {
            spyOn($.fn, 'qtip');
            this.view.render();
        });

        it("displays the name of the workspace as a link", function() {
            expect(this.view.$(".name span").eq(0).text()).toBe("Broccoli");
            expect(this.view.$(".name").eq(0).attr('href')).toBe(this.workspace1.showUrl());

            expect(this.view.$(".name span").eq(1).text()).toBe("Camels");
            expect(this.view.$(".name").eq(1).attr('href')).toBe(this.workspace2.showUrl());
        });

        it("displays the name of the owners as a link", function() {
            expect(this.view.$(".owner span").eq(0).text()).toBe("Green Giant");
            expect(this.view.$(".owner").eq(0).attr('href')).toBe(this.workspace1.owner().showUrl());

            expect(this.view.$(".owner span").eq(1).text()).toBe("Andre The Giant");
            expect(this.view.$(".owner").eq(1).attr('href')).toBe(this.workspace2.owner().showUrl());
        });

        it("qtipifies info_icons", function () {
            var qtipCall = $.fn.qtip.calls[0];
            expect(qtipCall.object.selector).toBe(".icon-info-sign");
        });

        it("shows info icons only for projects with summaries", function () {
            expect(this.view.$('.info_icon').length).toBe(this.collection.length - 1);
        });

        describe("latest insight section", function () {
            it("shows the latest insight", function () {
                var presenter = new chorus.presenters.Activity(this.workspace2.latestInsight());
                var insightHtml = presenter.headerHtml().string;

                expect(this.view.$('.insight')).toExist();
                expect(this.view.$('.insight .activity .activity_header')).toContainHtml(insightHtml);
            });

            it("does not show an insight if there are no insights", function () {
                expect(this.view.$('.insight .activity_item').length).toBe(this.collection.length - 1);
            });

            it("shows a link to all insights if there are more", function () {
                expect(this.view.$('.insight').eq(0).find('a.all_insights')).not.toExist();

                expect(this.view.$('.insight').eq(2).find('a.all_insights').text()).toMatchTranslation('project_card.insight.all_insights', {count: 2});
                expect(this.view.$('.insight').eq(2).find('a.all_insights').attr('href')).toBe(this.workspace3.showUrl()+'?filter=insights');
            });
        });
    });
});