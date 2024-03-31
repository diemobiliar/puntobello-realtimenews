import { IDropdownStyles } from 'office-ui-fabric-react';

export const dropdownStyles: Partial<IDropdownStyles> = {
  title: {
    fontSize: '18px',
    height: '40px',
    lineHeight: '37px',
    padding: '0 30px 0 12px',
    borderRadius: '4px',
    borderColor: '#969ba0',
    color: '#333',
  },
  dropdown: {
    selectors: {
      '&:hover .ms-Dropdown-title': {
        borderColor: '#969ba0',
        color: '#333',
      },
      '&:focus::after': {
        borderRadius: '4px',
        borderColor: '#da2323',
      },
    },
  },
  dropdownOptionText: {
    fontSize: '18px',
    color: '#333',
    lineHeight: '1.25',
  },
  caretDownWrapper: {
    right: '12px',
    height: '40px',
    lineHeight: '40px',
  },
  caretDown: {
    fontSize: '18px',
    color: '#333',
  },
  label: {
    position: 'absolute',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    width: '1px',
    height: '1px',
    whiteSpace: 'nowrap',
  },
};
