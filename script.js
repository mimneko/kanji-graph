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

    // JSONファイルからノードデータを取得する関数
    function fetchNodes() {
        return fetch('kanji-list.json') // JSONファイルのパスを指定
            .then(response => response.json())
            .catch(error => console.error('Error fetching nodes:', error));
    }

    function addAndValidateParents(nodes) {
        const nodeMap = new Map(nodes.map(node => [node.id, node]));
        const existingNodeIds = new Set(nodeMap.keys());

        nodes.forEach(node => {
            if (node.alternative && nodeMap.has(node.alternative)) {
                const parentValue = "g_" + node.alternative;
                node.parent = parentValue;
                nodeMap.get(node.alternative).parent = parentValue;
            }

            if (node.parent && !existingNodeIds.has(node.parent)) {
                nodes.push({ id: node.parent });
                existingNodeIds.add(node.parent);
            }
        });
    }

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

    // JSONデータを取得してCytoscapeを初期化する関数
    function initializeCytoscape() {
        fetchNodes().then(nodes => {
            addAndValidateParents(nodes);

            var edges = generateEdges(nodes);

            var cy = cytoscape({
                container: $("#IdCytoscape"),
                elements: {
                    nodes: nodes.map(node => { return { data: node }; }),
                    edges: edges
                },
                style: [
                    {
                        selector: '[color]',
                        style: {
                            'background-color': 'data(color)',
                            'label': 'data(label)'
                        }
                    },
                    {
                        selector: '[label]',
                        style: {
                            'label': 'data(label)'
                        }
                    },
                    {
                        selector: 'node',
                        style: {
                            'background-color': '#666',
                            'label': ''
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

            $('#IdLayoutContainer').on('mousedown mouseup click', function(e) {
                e.stopPropagation();
            });
        });
    }

    initializeCytoscape(); // Cytoscapeの初期化を実行
});
