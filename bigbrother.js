process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var jiraconfig = require('./jiraconfig')

var exports = module.exports = {};

if (jiraconfig.jiraUserName) {

    var JiraClient = require('jira-connector');

    var jira = new JiraClient( {
        host: 'jirapdi.tid.es',
        basic_auth: {
            username: jiraconfig.jiraUserName,
            password: jiraconfig.jiraPassword
        }
    });

    exports.askTo = function (user) {

        return new Promise(function (fulfill, reject){
        
        var question = "Hi " + user + ", currently JIRA says you are working on these issues...\n";
        opts = {jql:'assignee='+user+' and status = "In Progress"'};
        console.log(opts.jql);
        jira.search.search(opts, function(error, issues) {
            if (error) {
                fulfill("Hi " + user + ", tell me what you are currently working on...\n");
                return;
            }
            console.log(issues);
            var issuesList = issues.issues;
            for (var index in issuesList) {
                var issueQuestion = issuesList[index].key+" -> "+ issuesList[index].fields.summary;
                console.log(issueQuestion);
                question += "\n "+issueQuestion;
            }
            if (issuesList.length > 2) {
                question += "\n More than 2 issues? please, don't make me cry...."
            }

            question += "\n Tell me what you are currently working on... ^_^ "
            fulfill(question);
        });
      });
    }

} else {

    exports.askTo = function (user) {

        return new Promise(function (fulfill, reject){
        
            fulfill("Hi " + user + ", tell me what you are currently working on...\n");
            return;
        });
    }
}


