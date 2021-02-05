// LaunchBar Action Script

function run(argument) {
    return [
        { title: "download", subtitle: "更新", badge: "d", icon: "font-awesome:cloud-download" },
        { title: "upload", subtitle: "上传", badge: "u", icon: "font-awesome:cloud-upload" },
    ]
}


function upload() {

}

function download() {

}

function runWithString(input) {
    return [{ title: input }]
}