import { cloneFile } from '../cloneFile';
import { connect } from '@web-client/presenter/shared.cerebral';
import { props } from 'cerebral';
import { sequences } from '@web-client/presenter/app.cerebral';
import { state } from '@web-client/presenter/app.cerebral';
import React, { useEffect, useRef } from 'react';
import fileInput from '../../../../node_modules/@uswds/uswds/packages/usa-file-input/src';

const removeNode = node => {
  if (node && node.parentNode) {
    node.parentNode.removeChild(node);
  }
};

const removeFilesExceedingLimit = (dropTarget, e, filesExceedingSizeLimit) => {
  const currentPreviewHeading = dropTarget.querySelector(
    '.usa-file-input__preview-heading',
  );
  removeNode(currentPreviewHeading);

  const filePreviews = dropTarget.querySelectorAll('.usa-file-input__preview');
  const updatedFiles = [];
  filePreviews.forEach((file, index) => {
    const fileName = file.textContent.trim();
    if (filesExceedingSizeLimit.includes(fileName)) {
      removeNode(file);
    } else {
      updatedFiles.push(e.target.files[index]);
    }
  });

  const dataTransfer = new DataTransfer();
  updatedFiles.forEach(file => {
    dataTransfer.items.add(file);
  });

  e.target.files = dataTransfer.files;

  const instructions = dropTarget.querySelector(
    '.usa-file-input__instructions',
  );
  if (filesExceedingSizeLimit.length === filePreviews.length && instructions) {
    instructions.removeAttribute('hidden');
  }
};

function DragDropInput({
  existingFiles,
  fileInputName,
  handleChange,
  multiple,
  ...remainingProps
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!inputRef.current) return;
    fileInput.on(inputRef.current);
  }, [inputRef]);

  useEffect(() => {
    const fileInputElement = window.document.getElementById(
      'file-input',
    ) as HTMLInputElement;
    if (fileInputElement && existingFiles) {
      const loadFilesFromFormEvent = new Event('change');

      Object.defineProperty(loadFilesFromFormEvent, 'target', {
        value: {
          files: existingFiles,
        },
        writable: false,
      });

      fileInputElement.dispatchEvent(loadFilesFromFormEvent);
    }
  }, []);

  return (
    <input
      {...remainingProps}
      accept=".pdf"
      className="usa-file-input"
      id="file-input"
      multiple={multiple}
      name={fileInputName}
      ref={inputRef}
      type="file"
      onChange={handleChange}
    />
  );
}

function handleFileSelectionAndValidation(
  e,
  maxFileSize,
  updateFormValueSequence,
) {
  const { name: inputName } = e.target;
  const { files } = e.target;

  const filesExceedingSizeLimit = Array.from(files)
    .map(capturedFile => {
      if (capturedFile.size >= maxFileSize * 1024 * 1024) {
        return capturedFile.name;
      }
    })
    .filter(file => !!file);

  if (filesExceedingSizeLimit.length) {
    setTimeout(() => {
      const dropTarget = window.document.querySelector(
        '.usa-file-input__target',
      ) as HTMLInputElement;

      removeFilesExceedingLimit(dropTarget, e, filesExceedingSizeLimit);
    }, 1);
  }

  if (!files.length) return false;

  const clonedFilePromises = Array.from(files).map(capturedFile => {
    return cloneFile(capturedFile).catch(() => null);
  });

  Promise.all(clonedFilePromises)
    .then(clonedFiles => {
      const validatedFiles = clonedFiles.filter(file => file !== null);
      updateFormValueSequence({
        key: inputName,
        value: validatedFiles,
      });
    })
    .catch(() => {
      /* no-op */
    });
  // run validationSequence
}

export const FileInput = connect(
  {
    constants: state.constants,
    form: state.form,
    name: props.name,
    updateFormValueSequence: sequences[props.updateFormValueSequence],
    // validationSequence: sequences[props.validationSequence],
  },
  function FileInput({
    constants,
    form,
    multiple,
    name,
    updateFormValueSequence,
    ...remainingProps
    // validationSequence,
  }) {
    return (
      <React.Fragment>
        <DragDropInput
          {...remainingProps}
          existingFiles={form[name]}
          fileInputName={name}
          handleChange={e =>
            handleFileSelectionAndValidation(
              e,
              constants.MAX_FILE_SIZE_MB,
              updateFormValueSequence,
            )
          }
          multiple={multiple}
        />
      </React.Fragment>
    );
  },
);

FileInput.displayName = 'FileInput';
