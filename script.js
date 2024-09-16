var CytLayout = (function () {
    var _setLayout = function (cy, layoutName) {
        var layout = {
            name: layoutName,
            fit: true,
            animate: true,
            animationDuration: 500
        };
        cy.layout(layout).run();
        return layout;
    };
    return {
        setLayout: _setLayout
    };
})();

document.addEventListener("DOMContentLoaded", function () {
    var nodeColors = {
        '象形': '#3498db',
        '指事': '#e74c3c',
        '会意': '#2ecc71',
        '形声': '#f39c12',
        '会意形声': '#9b59b6',
        'パーツ': '#000000'
    };

    var setStyles = function (nodes, edges) {
        nodes.forEach(function (node) {
            var nodeColor = nodeColors[node.data('type')] || '#ffffff';
            var borderColor = node.data('type') ? '#ffffff' : '#dddddd';
            node.css({
                "width": 80,
                "height": 80,
                "content": node.data('label') || ' ',
                "text-valign": "center",
                "text-halign": "center",
                "background-color": nodeColor,
                "color": "#ffffff",
                "font-size": "24px",
                "font-weight": "bold",
                "border-width": "2px",
                "border-color": borderColor,
                "transition-property": "background-color, border-color",
                "transition-duration": "0.3s"
            });
        });
        edges.forEach(function (edge) {
            edge.css({
                "curve-style": "bezier",
                "target-arrow-shape": "triangle",
                "line-color": "#95a5a6",
                "target-arrow-color": "#95a5a6",
                "width": 3,
                "opacity": 0.7
            });
        });
    };

    var nodes = [
        { id: 'k1', label: '一', type: '指事' },
        { id: 'k6864', label: '皿', type: '象形' },
        { id: 'k10084', label: '血', type: '象形' },
        { id: 'k4099', label: '日', type: '象形' },
        { id: 'k4319', label: '月', type: '象形' },
        { id: 'k1127', label: '口', type: '象形' },
        { id: 'k13125', label: '鳥', type: '象形' },
        { id: 'b1', label: '艸', type: 'パーツ', alternative: 'b2' },
        { id: 'b2', label: '草冠', type: 'パーツ' },
        { id: 'k6893', label: '盟', type: '会意形声', components: ['k4133', 'k10084'] },
        { id: 'k4133', label: '明', type: '会意', components: ['k4099', 'k4319'] },
        { id: 'k9203', label: '艸の萌', type: '形声', components: ['b1', 'k4133'], alternative: 'k9204' },
        { id: 'k9204', label: '萌', type: '形声', components: ['b2', 'k4133'] },
        { id: 'k9457', label: '蔦', type: '形声', components: ['b2', 'k13125'] },
        { id: 'k13134', label: '鳴', type: '会意', components: ['k1127', 'k13125'] },
    ];

    function addAndValidateParents(nodes) {
        // すべての id とそれに対応するノードを検索するためのマップを作成
        const nodeMap = new Map(nodes.map(node => [node.id, node]));
        const existingNodeIds = new Set(nodeMap.keys()); // 既存ノードのidをセットに格納
    
        nodes.forEach(node => {
            if (node.alternative && nodeMap.has(node.alternative)) {
                // alternative の値に 'g_' を追加し、対象ノードと自身に parent を設定
                const parentValue = "g_" + node.alternative;
                node.parent = parentValue;
                nodeMap.get(node.alternative).parent = parentValue;
            }
    
            // parentが指定されているが、既存ノードに含まれていない場合
            if (node.parent && !existingNodeIds.has(node.parent)) {
                nodes.push({ id: node.parent });
                existingNodeIds.add(node.parent); // 新しいノードをセットに追加
            }
        });
    }
    
    addAndValidateParents(nodes);
    
    // ノード情報をコンソール表示
    console.log(nodes);
    

    // エッジを動的に生成する関数
    var generateEdges = function(nodes) {
        var edges = [];
        nodes.forEach(function(node) {
            if (node.components) {
                node.components.forEach(function(targetId) {
                    edges.push({
                        data: {
                            id: node.id + '-' + targetId,
                            source: targetId,
                            target: node.id
                        }
                    });
                });
            }
        });
        return edges;
    };

    var edges = generateEdges(nodes);

    var cy = cytoscape({
        container: $("#IdCytoscape"),
        elements: {
            nodes: nodes.map(function(node) {
                return { data: node };  // 各ノードを data として渡す
            }),
            edges: edges // エッジデータを渡す
        },
        style: [
            {
                // colorフィールドを持つノードのみ対象
                selector: '[color]',
                style: {
                    'background-color': 'data(color)',
                    'label': 'data(label)' // labelフィールドがある場合のスタイル
                }
            },
            {
                // labelフィールドを持つノードのみ対象
                selector: '[label]',
                style: {
                    'label': 'data(label)' // labelフィールドがある場合にのみ適用
                }
            },
            {
                // デフォルトのノードスタイル
                selector: 'node',
                style: {
                    'background-color': '#666',  // デフォルトの色
                    'label': '' // デフォルトのlabelスタイルを空に設定
                }
            },
            {
                selector: 'edge',
                style: {
                    'width': 3,
                    'line-color': '#ccc',
                    'target-arrow-color': '#ccc',
                    'target-arrow-shape': 'triangle',
                    'curve-style': 'bezier'
                }
            }
        ]
    });
    
    

    setStyles(cy.nodes(), cy.edges());

    cy.panzoom({
        zoomFactor: 0.05,
        zoomDelay: 45,
        minZoom: 0.1,
        maxZoom: 10,
        fitPadding: 50,
        panSpeed: 10,
        panDistance: 10,
        panDragAreaSize: 75,
        panMinPercentSpeed: 0.25,
        panInactiveArea: 8,
        panIndicatorMinOpacity: 0.5,
        zoomOnly: false,
        fitSelector: undefined,
        animateOnFit: function () {
            return false;
        },
        fitAnimationDuration: 1000
    });

    CytLayout.setLayout(cy, "fcose");
    $("#IdLayout").change(function () {
        CytLayout.setLayout(cy, $("#IdLayout").val());
    });

    // ドロップダウンリストの操作を可能にする
    $('#IdLayoutContainer').on('mousedown mouseup click', function(e) {
        e.stopPropagation();
    });
});