// LaunchBar Action Script
include('user.js');

const auth = getUser().toBase64String();
const host = getHost();

const request = function (method, url, options) {
    return HTTP[method + "JSON"](host + url, {

        ...options,
        timeout: 5,
        headerFields: {
            "Authorization": `Basic ${auth}`
        }
    })
}

function getParameters(job, name) {
    const { data } = request('get', `/job/${job}/descriptorByName/net.uaznia.lukanus.hudson.plugins.gitparameter.GitParameterDefinition/fillValueItems?param=${name}`)
    return data.values;
}

function getEnvs(job) {
    const { data } = request('get', `/job/${job}/api/json`);

    if (!data) {
        return ['prod']
    }

    const def = data.actions.find(action => action._class === 'hudson.model.ParametersDefinitionProperty')
    const { choices } = def.parameterDefinitions.find(param => param.name === 'BuildEnv');
    return choices;
}

function run(input) {
    const { data } = request('get', `/api/json?tree=jobs[name,description]&pretty=true`);

    if (!data) {
        LaunchBar.alert('请求错误', JSON.stringify(data))
        return
    }

    return data.jobs.map(job => {
        return {
            title: job.name,
            subtitle: job.description || '',
            job: job.name,
            icon: `character:${job.name[0]}`,
            action: 'showBranch',
            actionReturnsItems: true,
        }
    })
}

function showBranch({ job }) {
    const branchs = getParameters(job, 'branch');

    return branchs.map(item => {
        return {
            title: item.name,
            action: 'showEnv',
            actionReturnsItems: true,
            branch: item.name,
            job
        }
    })
}

function showEnv({ job, branch }) {
    const envs = getEnvs(job);
    return envs.map(item => {
        return {
            title: item,
            action: 'trigger',
            job, branch, BuildEnv: item
        }

    })
}

function trigger(arguments) {
    const { job, branch, BuildEnv } = arguments;

    const api = `/job/${job}/buildWithParameters?branch=${branch}&BuildEnv=${BuildEnv}`
    const url = `${host}/job/${job}`;
    request('post', api);
    LaunchBar.displayNotification({
        title: '构建开始',
        string: `构建 ${job} 已开始`,
        url: `${host}/job/${job}`
    });

    LaunchBar.openUrl(url);
}