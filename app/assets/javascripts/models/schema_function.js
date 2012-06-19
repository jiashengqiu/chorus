chorus.models.SchemaFunction = chorus.models.Base.extend({
    constructorName: "SchemaFunction",
    toText:function () {
        var argNames = this.get('argNames');
        var functionArguments = _.map(this.get('argTypes'), function (argType, index) {
            var argName = argNames[index] || "arg" + (index + 1);
            return argType + ' ' + argName;
        });

        var schemaName = this.safePGName(this.get("schemaName"));
        var functionName = this.safePGName(this.get("name"));

        var result = schemaName + "." + functionName + '(';
        result = result + functionArguments.join(', ');
        result = result + ')';
        return result;
    },

    toHintText:function () {
        var argNames = this.get('argNames');
        var functionArguments = _.map(this.get('argTypes'), function (argType, index) {
            var argName = argNames[index] || "arg" + (index + 1);
            return argType + ' ' + argName;
        });

        var result = this.get("returnType") + " " + this.get('name') + '(';
        result = result + functionArguments.join(', ');
        result = result + ')';
        return result;
    }
});