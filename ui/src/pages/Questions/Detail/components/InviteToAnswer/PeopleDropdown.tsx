/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { FC, useEffect, useState } from 'react';
import { Dropdown, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import { loggedUserInfoStore } from '@/stores';
import { userSearchByName } from '@/services';
import { Avatar } from '@/components';
import * as Type from '@/common/interface';
import './PeopleDropdown.scss';

interface Props {
  selectedPeople: Type.UserInfoBase[] | undefined;
  onSelect: (people: Type.UserInfoBase) => void;
}

const Index: FC<Props> = ({ selectedPeople = [], onSelect }) => {
  const { user: currentUser } = loggedUserInfoStore();
  const { t } = useTranslation('translation', {
    keyPrefix: 'invite_to_answer',
  });
  const [toggleState, setToggleState] = useState(false);
  const [peopleList, setPeopleList] = useState<Type.UserInfoBase[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchValue, setSearchValue] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const handleCheckboxChange = (idx) => {
    console.log(idx);
    setIsChecked(!isChecked);
  };

  const filterAndSetPeople = (source) => {
    const filteredPeople: Type.UserInfoBase[] = [];
    source.forEach((p) => {
      if (currentUser && currentUser.username === p.username) {
        return;
      }
      if (selectedPeople.find((_) => _.username === p.username)) {
        return;
      }
      filteredPeople.push(p);
    });
    setPeopleList(filteredPeople);
  };

  const searchPeople = (s) => {
    if (!s) {
      setPeopleList([]);
      return;
    }
    userSearchByName(s).then((resp) => {
      filterAndSetPeople(resp);
    });
  };
  const handleSearch = (evt) => {
    const s = evt.target.value;
    setSearchValue(s);
    searchPeople(s);
  };

  const resetSearch = () => {
    // setCurrentIndex(0);
    // setSearchValue('');
    // setPeopleList([]);
  };

  const handleSelect = (idx) => {
    if (idx < 0 || idx >= peopleList.length) {
      return;
    }
    const people = peopleList[idx];
    if (people) {
      handleCheckboxChange(idx);
      onSelect(people);
    }

    resetSearch();
  };

  const handleKeyDown = (evt) => {
    evt.stopPropagation();

    if (!peopleList?.length) {
      return;
    }
    const { keyCode } = evt;
    if (keyCode === 38 && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
    if (keyCode === 40 && currentIndex < peopleList.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }

    if (keyCode === 13 && currentIndex > -1) {
      evt.preventDefault();
      handleSelect(currentIndex);
    }
  };

  // useEffect(() => {
  //   filterAndSetPeople(peopleList);
  // }, [selectedPeople]);

  useEffect(() => {
    searchPeople(searchValue);
  }, [toggleState]);

  return (
    <Dropdown
      className="d-flex flex-column people-dropdown"
      onSelect={handleSelect}
      onKeyDown={handleKeyDown}
      onToggle={setToggleState}>
      <Form.Control
        autoFocus
        type="search"
        placeholder={t('search')}
        value={searchValue}
        onChange={handleSearch}
      />
      {peopleList.map((p, idx) => {
        return (
          <Dropdown.Item
            key={p.username}
            eventKey={idx}
            active={idx === currentIndex}
            className={idx === 0 ? 'mt-2' : ''}>
            <div className="d-flex text-nowrap">
              <div className="d-flex form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  value=""
                  id={`flexCheckDefault-${idx}`}
                  checked={isChecked}
                />
                <label
                  className="form-check-label"
                  htmlFor="flexCheckDefualt"
                />
              </div>
              <Avatar
                avatar={p.avatar}
                size="24"
                alt={p.display_name}
                className="rounded-1"
              />
              <div className="d-flex flex-wrap text-truncate">
                <span className="ms-2 text-truncate">{p.display_name}</span>
                <small className="text-secondary text-truncate ms-2">
                  @{p.username}
                </small>
              </div>
            </div>
          </Dropdown.Item>
        );
      })}
    </Dropdown>
  );
};

export default Index;
