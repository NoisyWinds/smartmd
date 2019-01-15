# Documentation

### Build Setup
```node
# install reference
npm install smartmd 

# build for development
npm run dev

# build for production
npm run build
```
### Quickstart
```javascript
var editor = new Smartmd({
   el: "#editor",
   height: "400px"
});
```

### Setting
```javascript
var editor = new Smartmd({
   // editor element {string} 
   el: "#editor",
   
   // editor wrapper layout {string or number}
   height: "400px",
   width: "100%",
   
   // autosave 
   autoSave: {
     // uuid is required {string or number}
     uuid: 1,
     // {number}
     delay: 5000
   },
   
   // init state {boolean}
   isFullScreen: true, // default false
   isPreviewActive: true // default false
   
});
```
#### All Setting:

| name | type | default | description |
| ------ | ------| ------ | ------ |
| el | dom | undefined | editor element
| width | string/number | "auto" | width
| height | string/number | "auto" | height
| autoSave | object | undefined | set uuid to start autosave
| autoSave.uuid | string/number | undefined | store key
| autoSave.delay | string/number | 5000 | autosave delay
| isFullScreen | Boolean | false | isFullScreen
| isPreviewActive | Boolean | false | isPreviewActive
| uploadPath | url | /upload | image upload path
| uploads | object | object | uploads setting
| uploads.maxSize | number | 'Image support format {type}.' | upload maxSize
| uploads.type | array | ['jpeg', 'png', 'bmp', 'gif', 'jpg'] | upload type
| uploads.typeError | string |  'Image support format {type}.' | type error message, {type} is your uploads valid type
| uploads.sizeError | string |  'Image size is more than {maxSize} kb.' | maxSize error message, {maxSize} is your uploads maximum allowable size (one file)
| uploads.serverError | string |  'Upload failed on {msg}'  | server error message, {msg} is your server return message
| statusbar | array | ['block','autoSave', 'lines', 'words', 'cursor'] | statusbar shortcode

#### some object setting 
```javascript
const options = {
  autoSave: {
   uuid: 1,
   delay: 5000
  },
  uploads: {
    type: ['jpeg', 'png', 'bmp', 'gif', 'jpg'],
    maxSize: 4096,
    typeError: 'Image support format {type}.',
    sizeError: 'Image size is more than {maxSize} kb.',
    serverError: 'Upload failed on {msg}' 
  }
}
```
 
#### feature



