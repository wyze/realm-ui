// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface IConnector {
  function ownerOf(uint256 tokenId) external view returns (address owner);
}

contract Realm is ERC721Enumerable, ReentrancyGuard, Ownable {
  bytes internal constant TABLE =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

  uint256 private constant REALM_SIZE = 10**6 * 3;
  uint256 private constant DEFAULT_WEALTH = 1000;
  uint256 private constant ACTION_HOURS = 12 hours;

  uint256 public price = 10000000000000000;
  uint256 public partnerPrice = 5000000000000000;
  uint256 public supply = 10000;

  uint256[35] private PROBABILITY = [
    2,
    3,
    5,
    7,
    11,
    13,
    17,
    19,
    23,
    25,
    29,
    31,
    37,
    39,
    41,
    43,
    47,
    51,
    53,
    57,
    59,
    61,
    65,
    67,
    71,
    75,
    77,
    79,
    83,
    85,
    89,
    92,
    94,
    96,
    100
  ];

  string[35] public features = [
    "Pond", // 0
    "Valley", // 1
    "Gulf", // 2
    "Basin", // 3
    "Butte", // 4
    "Canal", // 5
    "Cape", // 6
    "Prairie", // 7
    "Plateau", // 8
    "Mesa", // 9
    "Peninsula", // 10
    "River", // 11
    "Sea", // 12
    "Cove", // 13
    "Lake", // 14
    "Swamp", // 15
    "Tundra", // 16
    "Bay", // 17
    "Ice shelf", // 18
    "Dune", // 19
    "Fjord", // 20
    "Geyser", // 21
    "Glacier", // 22
    "Ocean", // 23
    "Desert", // 24
    "Biosphere", // 25
    "Lagoon", // 26
    "Mountain", // 27
    "Island", // 28
    "Canyon", // 29
    "Cave", // 30
    "Oasis", // 31
    "Waterfall", // 32
    "Reef", // 33
    "Volcano" // 34
  ];

  struct realm {
    string name;
    uint256 size;
    uint256 createdAt;
    bool partner;
  }

  struct Connector {
    address _contract;
    uint256 start;
    uint256 end;
    bool exists;
  }

  mapping(uint256 => realm) public realms;
  mapping(uint256 => uint256) public wealth;
  mapping(uint256 => uint256) public explorer;
  mapping(uint256 => uint256) public explorerTime;
  mapping(uint256 => uint256) public terraformTime;
  mapping(address => Connector) public connectors;
  mapping(uint256 => mapping(uint256 => uint256)) public realmFeatures;

  event RealmCreated(
    string name,
    uint256 size,
    bool partner,
    string feature1,
    string feature2,
    string feature3
  );
  event Explored(
    uint256 realmId,
    uint256 explored,
    uint256 wealthGained,
    uint256 totalExplored,
    uint256 totalWealth
  );
  event Terraform(
    uint256 realmId,
    string feature1,
    string feature2,
    string feature3
  );
  event ConnectorCreated(address _contract, uint256 start, uint256 end);
  event ConnectorRemoved(address _contract);
  event WealthSpent(uint256 realmId, uint256 WealthSpent, uint256 totalWealth);

  constructor() ERC721("Realm", "REALM") Ownable() {}

  function explore(uint256 _realmId) external {
    require(_isApprovedOrOwner(msg.sender, _realmId));
    require(
      block.timestamp > explorerTime[_realmId],
      "You are currently exploring"
    );
    require(
      explorer[_realmId] < realms[_realmId].size,
      "You've explored the whole map"
    );

    uint256 _wealthGained = _random(wealth[_realmId], DEFAULT_WEALTH) +
      DEFAULT_WEALTH;

    explorer[_realmId] += _wealthGained;
    wealth[_realmId] += _wealthGained;

    // You can explore every 12 hours
    explorerTime[_realmId] = block.timestamp + ACTION_HOURS;

    emit Explored(
      _realmId,
      _wealthGained,
      _wealthGained,
      explorer[_realmId],
      wealth[_realmId]
    );
  }

  function spendWealth(uint256 _realmId, uint256 _wealth) external {
    require(_wealth <= wealth[_realmId], "Not enough wealth");
    require(_isApprovedOrOwner(msg.sender, _realmId));

    wealth[_realmId] -= _wealth;

    emit WealthSpent(_realmId, _wealth, wealth[_realmId]);
  }

  function terraform(uint256 _realmId, uint256 _feature) external {
    require(_isApprovedOrOwner(msg.sender, _realmId));
    require(_feature <= 2, "Feature must be 0 to 2");
    require(block.timestamp > terraformTime[_realmId], "Allowed once a year");

    uint256 _newFeatureId = _random(realms[_realmId].size, features.length);

    // Update feature
    realmFeatures[_realmId][_feature] = _newFeatureId;

    // Allowed once a year
    terraformTime[_realmId] = block.timestamp + 365 days;

    emit Terraform(
      _realmId,
      features[realmFeatures[_realmId][0]],
      features[realmFeatures[_realmId][1]],
      features[realmFeatures[_realmId][2]]
    );
  }

  function claim(uint256 _realmId, string memory _name)
    external
    payable
    nonReentrant
  {
    require(msg.value >= price, "Eth sent is not enough");
    require(_realmId > 5 && _realmId <= supply, "_realmId invalid");
    require(!_exists(_realmId), "_realmId invalid");

    _createRealm(_realmId, _name, false);
    _safeMint(_msgSender(), _realmId);
  }

  function claimAsPartner(
    address _contract,
    uint256 _partnerId,
    uint256 _realmId,
    string memory _name
  ) external payable nonReentrant {
    require(connectors[_contract].exists, "Contract not allowed");
    require(msg.value >= partnerPrice, "Eth sent is not enough");
    require(
      _realmId > connectors[_contract].start &&
        _realmId < connectors[_contract].end,
      "_realmId not in range"
    );
    require(!_exists(_realmId), "_realmId doesn't exist");

    IConnector connector = IConnector(_contract);

    require(
      connector.ownerOf(_partnerId) == msg.sender,
      "You do not own the _partnerId"
    );

    _createRealm(_realmId, _name, true);
    _safeMint(_msgSender(), _realmId);
  }

  function ownerClaim(uint256 _realmId, string memory _name)
    external
    nonReentrant
    onlyOwner
  {
    require(_realmId <= 5, "_realmId invalid");
    require(!_exists(_realmId), "_realmId invalid");

    _createRealm(_realmId, _name, false);
    _safeMint(owner(), _realmId);
  }

  function setPrice(uint256 _newPrice, uint256 _type) external onlyOwner {
    if (_type == 0) {
      price = _newPrice;
    } else {
      partnerPrice = _newPrice;
    }
  }

  function setSupply(uint256 _supply) external onlyOwner {
    supply = _supply;
  }

  function setConnector(
    address _contract,
    uint256 _start,
    uint256 _end
  ) external onlyOwner {
    connectors[_contract]._contract = _contract;
    connectors[_contract].start = _start;
    connectors[_contract].end = _end;
    connectors[_contract].exists = true;

    emit ConnectorCreated(_contract, _start, _end);
  }

  function removeConnector(address _contract) external onlyOwner {
    delete connectors[_contract];

    emit ConnectorRemoved(_contract);
  }

  function getRealm(uint256 _realmId)
    external
    view
    returns (
      string memory,
      uint256,
      uint256,
      bool
    )
  {
    return (
      realms[_realmId].name,
      realms[_realmId].size,
      realms[_realmId].createdAt,
      realms[_realmId].partner
    );
  }

  function hasConnector(address _contract) external view returns (bool) {
    return connectors[_contract].exists;
  }

  function ownerWithdraw() external onlyOwner {
    payable(owner()).transfer(address(this).balance);
  }

  function tokenURI(uint256 _realmId)
    public
    view
    override
    returns (string memory)
  {
    string[5] memory _parts;

    _parts[
      0
    ] = '<?xml version="1.0" encoding="UTF-8"?><svg width="350px" height="350px" viewBox="0 0 350 350" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><rect fill="#ffb300" x="0" y="0" width="350" height="350"></rect><text x="50%" y="40%" dominant-baseline="middle" text-anchor="middle" fill-opacity="50%" font-size="65px" fill="#fff" font-family="Georgia">Realm</text><text x="50%" y="62%" fill-opacity="100%" fill="#fff" dominant-baseline="middle" text-anchor="middle" font-size="24px" font-family="Georgia">';
    _parts[1] = realms[_realmId].name;
    _parts[
      2
    ] = '</text><text x="50%" y="69%" fill-opacity="100%" fill="#fff" dominant-baseline="middle" text-anchor="middle" font-size="12px" font-family="Georgia">';
    _parts[3] = _featureNames(_realmId);
    _parts[
      4
    ] = '</text><line class="line" stroke-width="5" x1="125" x2="137" y1="185" y2="185"></line> <line class="line" stroke-width="5" x1="147" x2="148" y1="185" y2="185"></line> <line class="line" stroke-width="5" x1="158" x2="170" y1="185" y2="185"></line> <line class="line" stroke-width="5" x1="180" x2="181" y1="185" y2="185"></line> <line class="line" stroke-width="5" x1="191" x2="192" y1="185" y2="185"></line> <line class="line" stroke-width="5" x1="202" x2="214" y1="185" y2="185"></line> <line class="line" stroke-width="5" x1="224" x2="225" y1="185" y2="185"></line><style type="text/css">.line{stroke:white;stroke-linecap:round;opacity:50%}</style></svg>';

    string memory _output = string(
      abi.encodePacked(_parts[0], _parts[1], _parts[2], _parts[3], _parts[4])
    );

    string memory _atrrOutput = _makeAttributeParts(_realmId);
    string memory _json = _encode(
      bytes(
        string(
          abi.encodePacked(
            '{"name": "Realm #',
            _toString(_realmId),
            '", "description": "Discover your Realm. Explore. Mine. Research. Build.", "image": "data:image/svg+xml;base64,',
            _encode(bytes(_output)),
            '"',
            ',"attributes":',
            _atrrOutput,
            "}"
          )
        )
      )
    );
    _output = string(abi.encodePacked("data:application/json;base64,", _json));

    return _output;
  }

  function _createRealm(
    uint256 _realmId,
    string memory _name,
    bool _partner
  ) internal {
    realms[_realmId].name = _name;
    realms[_realmId].size = _randomFromString(_name, REALM_SIZE) + REALM_SIZE;
    realms[_realmId].createdAt = block.timestamp;
    realms[_realmId].partner = _partner;

    realmFeatures[_realmId][0] = _randomFromString(
      realms[_realmId].name,
      features.length
    );
    realmFeatures[_realmId][1] = _random(
      realms[_realmId].size,
      features.length
    );
    realmFeatures[_realmId][2] = _random(
      realms[_realmId].createdAt,
      features.length
    );

    emit RealmCreated(
      realms[_realmId].name,
      realms[_realmId].size,
      _partner,
      features[realmFeatures[_realmId][0]],
      features[realmFeatures[_realmId][1]],
      features[realmFeatures[_realmId][2]]
    );
  }

  function _random(uint256 _salt, uint256 _limit)
    internal
    view
    returns (uint256)
  {
    return
      uint256(
        keccak256(abi.encodePacked(block.number, block.timestamp, _salt))
      ) % _limit;
  }

  function _randomFromString(string memory _salt, uint256 _limit)
    internal
    view
    returns (uint256)
  {
    return
      uint256(
        keccak256(abi.encodePacked(block.number, block.timestamp, _salt))
      ) % _limit;
  }

  function _rarity(uint256 _salt, uint256 _limit)
    internal
    view
    returns (uint256)
  {
    uint256 _rand = _randomFromString(string(abi.encodePacked(_salt)), _limit);

    uint256 j = 0;
    for (; j < PROBABILITY.length; j++) {
      if (_rand <= PROBABILITY[j]) {
        break;
      }
    }
    return j;
  }

  function _makeAttributeParts(uint256 _realmId)
    internal
    view
    returns (string memory)
  {
    string[9] memory _parts;

    _parts[0] = '[{ "trait_type": "Realm", "value": "';
    _parts[1] = realms[_realmId].name;
    _parts[2] = '" }, { "trait_type": "Geographical Feature 1", "value": "';
    _parts[3] = features[realmFeatures[_realmId][0]];
    _parts[4] = '" }, { "trait_type": "Geographical Feature 2", "value": "';
    _parts[5] = features[realmFeatures[_realmId][1]];
    _parts[6] = '" }, { "trait_type": "Geographical Feature 3", "value": "';
    _parts[7] = features[realmFeatures[_realmId][2]];
    _parts[8] = '" }]';

    string memory _output = string(
      abi.encodePacked(_parts[0], _parts[1], _parts[2], _parts[3], _parts[4])
    );
    _output = string(
      abi.encodePacked(_output, _parts[5], _parts[6], _parts[7], _parts[8])
    );

    return _output;
  }

  function _featureNames(uint256 _realmId)
    internal
    view
    returns (string memory)
  {
    return
      string(
        abi.encodePacked(
          features[realmFeatures[_realmId][0]],
          " | ",
          features[realmFeatures[_realmId][1]],
          " | ",
          features[realmFeatures[_realmId][2]]
        )
      );
  }

  function _toString(uint256 value) internal pure returns (string memory) {
    // Inspired by OraclizeAPI's implementation - MIT license
    // https://github.com/oraclize/ethereum-api/blob/b42146b063c7d6ee1358846c198246239e9360e8/oraclizeAPI_0.4.25.sol

    if (value == 0) {
      return "0";
    }
    uint256 temp = value;
    uint256 digits;
    while (temp != 0) {
      digits++;
      temp /= 10;
    }
    bytes memory buffer = new bytes(digits);
    while (value != 0) {
      digits -= 1;
      buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
      value /= 10;
    }
    return string(buffer);
  }

  function _encode(bytes memory data) internal pure returns (string memory) {
    uint256 len = data.length;
    if (len == 0) return "";

    // multiply by 4/3 rounded up
    uint256 encodedLen = 4 * ((len + 2) / 3);

    // Add some extra buffer at the end
    bytes memory result = new bytes(encodedLen + 32);

    bytes memory table = TABLE;

    assembly {
      let tablePtr := add(table, 1)
      let resultPtr := add(result, 32)

      for {
        let i := 0
      } lt(i, len) {

      } {
        i := add(i, 3)
        let input := and(mload(add(data, i)), 0xffffff)

        let out := mload(add(tablePtr, and(shr(18, input), 0x3F)))
        out := shl(8, out)
        out := add(
          out,
          and(mload(add(tablePtr, and(shr(12, input), 0x3F))), 0xFF)
        )
        out := shl(8, out)
        out := add(
          out,
          and(mload(add(tablePtr, and(shr(6, input), 0x3F))), 0xFF)
        )
        out := shl(8, out)
        out := add(out, and(mload(add(tablePtr, and(input, 0x3F))), 0xFF))
        out := shl(224, out)

        mstore(resultPtr, out)

        resultPtr := add(resultPtr, 4)
      }

      switch mod(len, 3)
      case 1 {
        mstore(sub(resultPtr, 2), shl(240, 0x3d3d))
      }
      case 2 {
        mstore(sub(resultPtr, 1), shl(248, 0x3d))
      }

      mstore(result, encodedLen)
    }

    return string(result);
  }
}
