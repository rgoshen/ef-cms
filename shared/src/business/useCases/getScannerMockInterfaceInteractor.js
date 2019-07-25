const { image1, image2 } = require('./scannerMockFiles');

let scanBuffer = [];

const DWObject = {
  AcquireImage: () => {

    const b64toBlob = (b64Data, contentType='', sliceSize=512) => {
      const byteCharacters = atob(b64Data);
      const byteArrays = [];
    
      for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);
    
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
    
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
    
      const blob = new Blob(byteArrays, { type: contentType });
      return blob;
    }

    scanBuffer.push(b64toBlob(image1, 'image/png'))
    scanBuffer.push(b64toBlob(image2, 'image/png'))
    DWObject.HowManyImagesInBuffer += 2;
  },
  CloseSource: () => null,
  ConvertToBlob: (indicies, type, resolve) => {
    console.log('indicies', indicies);
    const blob = scanBuffer[indicies[0]];
    console.log('blob', blob);
    resolve(blob);
  },
  DataSourceStatus: null,
  ErrorCode: null,
  ErrorString: null,
  HowManyImagesInBuffer: 0,
  OpenSource: () => null,
  RemoveAllImages: () => (scanBuffer = []),
  SelectSourceByIndex: () => null,
};

exports.getScannerInterface = () => {
  const completeScanSession = async () => {
    const count = DWObject.HowManyImagesInBuffer;
    const promises = [];
    const response = { error: null, scannedBuffer: null };
    console.log('count', count);
    for (let index = 0; index < count; index++) {
      promises.push(
        new Promise((resolve, reject) => {
          console.log('we are here');
          DWObject.ConvertToBlob(
            [index],
            null,
            data => {
              console.log('data', data);
              resolve(data);
            },
            reject,
          );
        }),
      );
    }

    return await Promise.all(promises)
      .then(async blobs => {
        console.log('blobs', blobs);
        const blobBuffers = [];

        for (let blob of blobs) {
          blobBuffers.push(
            new Uint8Array(await new Response(blob).arrayBuffer()),
          );
        }
        response.scannedBuffer = blobBuffers;
        return response;
      })
      .catch(err => {
        response.error = err;
        return response;
      })
      .finally(() => {
        DWObject.RemoveAllImages();
        DWObject.CloseSource();
      });
  };

  const getScanCount = () => DWObject.HowManyImagesInBuffer;

  const loadDynamsoft = ({ cb }) => {
    cb();
  };

  const getSources = () => {
    return ['scanner A', 'scanner B'];
  };

  const getScanError = () => {
    return {
      code: DWObject.ErrorCode,
      message: DWObject.ErrorString,
    };
  };

  const getSourceStatus = () => {
    // 0	The Data Source is closed
    // 1	The Data Source is opened
    // 2	The Data Source is enabled
    // 3	The Data Source is acquiring images
    return DWObject.DataSourceStatus;
  };

  const setSourceByIndex = index => {
    return DWObject.SelectSourceByIndex(index) > -1;
  };

  const getSourceNameByIndex = index => {
    const sources = getSources();
    return sources[index];
  };

  const setSourceByName = sourceName => {
    const sources = getSources();
    const index = sources.indexOf(sourceName);
    if (index > -1) {
      return setSourceByIndex(index);
    } else {
      // Handle case where a named sources isn't found
      return false;
    }
  };

  const startScanSession = () => {
    DWObject.IfDisableSourceAfterAcquire = true;
    DWObject.OpenSource();
    DWObject.AcquireImage();
  };

  return {
    DWObject,
    completeScanSession,
    getScanCount,
    getScanError,
    getSourceNameByIndex,
    getSourceStatus,
    getSources,
    loadDynamsoft,
    setSourceByIndex,
    setSourceByName,
    startScanSession,
  };
};
