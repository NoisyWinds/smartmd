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
...more
 


