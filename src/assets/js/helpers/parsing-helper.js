let remote = require("electron").remote;
let sftpHelper = require("./sftp-helper");

let getFolders = (data)=>{
   var scannedFolders = [];
   
   if(Array.isArray(data)) {
      data.forEach((d) =>{
         if (d.type === 'd') {
            scannedFolders.push(d);
         }
      });
   } else {
      console.warn("Given data to getFolder function is not array, therefore it is not supported");
   }

   return scannedFolders;
}

let getFiles = (data)=>{
   var scannedFiles = [];
   
   if(Array.isArray(data)) {
      data.forEach((d) =>{
         if (d.type === '-') {
            scannedFiles.push(d);
         }
      });
   } else {
      console.warn("Given data to getFiles function is not array, therefore it is not supported");
   }

   return scannedFiles;
}

let renderFilesHTML = async (files)=>{
   let html = "";
   let cwd = sftpHelper.getCWD()

   if(files.length) {
      files.forEach((file) =>{
         const name = escapeHTML(file.name),
               fileSize = bytesToSize(file.size),
               path = cwd.concat('/', name);
         let   fileType = name.split('.'),
               icon = '<span class="icon file></span>';
         fileType = fileType[fileType.length-1];

         icon = '<span class="icon file f-'+fileType+'">.'+fileType+'</span>';
         const fileHTML = '<li class="files"><a href="'+ path+'" title="'+ path +'" class="files">'+icon+'<span class="name">'+ name +'</span> <span class="details">'+fileSize+'</span></a></li>';
         html = html.concat(fileHTML);
      })
   }  
   return html;
}


let getLengthOfFolder = async (folderPath) => {
   let folderContents = await sftpHelper.getDirList(folderPath);
   return folderContents.length;
}


let renderFoldersHTML = async (folders) => {
   let folderHTML = ``;
   let folderPath = sftpHelper.getCWD();

   if(folders.length){

      for(const folder of folders){
         const folderName = escapeHTML(folder.name);
         folderPath = folderPath.concat('/',folderName); 
         let folderLength = await getLengthOfFolder(folderPath); 
         let folderIcon = '<span class="icon folder"></span>';

         if(folderLength){
            folderIcon = '<span class="icon folder full"></span>';
         }

         if(folderLength == 1){
            folderLength += ' item';
         }
         else if(folderLength > 1){
            folderLength += ' items';
         }
         else {
            folderLength = 'Empty';
         }
         folderHTML = folderHTML + `<li class="folders">
                                       <a name="${folderName}" title="${folderPath}" class="folders">
                                          ${folderIcon}
                                          <span class="name">${folderName}</span> 
                                          <span class="details">${folderLength}</span>
                                       </a>
                                    </li>`;
         folderPath = sftpHelper.getCWD();

      }
   }
   return folderHTML;
}


//Below are the helper functions for above method
let escapeHTML = (text)=>{
   return text.replace(/\&/g,'&amp;').replace(/\</g,'&lt;').replace(/\>/g,'&gt;');
}

let bytesToSize = (bytes)=>{
   var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
   if (bytes == 0) return '0 Bytes';
   var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
   return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

module.exports = {
   getFolders: getFolders,
   getFiles: getFiles,
   renderFoldersHTML: renderFoldersHTML,
   renderFilesHTML: renderFilesHTML
};